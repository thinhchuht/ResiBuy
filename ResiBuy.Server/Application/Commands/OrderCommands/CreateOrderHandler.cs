using DocumentFormat.OpenXml.Spreadsheet;
using ResiBuy.Server.Application.Commands.OrderCommands.Dtos;
using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.Model;

namespace ResiBuy.Server.Application.Commands.OrderCommands
{
    public record CreateOrder(CreateOrderRequest Request) : IRequest<CreateOrderResponse>;

    public class CreateOrderHandler : IRequestHandler<CreateOrder, CreateOrderResponse>
    {
        private readonly ResiBuyContext _context;
        private readonly IVNPayService _vnPayService;
        private readonly IOrderDbService _orderDbService;

        public CreateOrderHandler(ResiBuyContext context, IVNPayService vnPayService, IOrderDbService orderDbService)
        {
            _context = context;
            _vnPayService = vnPayService;
            _orderDbService = orderDbService;
        }

        public async Task<CreateOrderResponse> Handle(CreateOrder command, CancellationToken cancellationToken)
        {
            var request = command.Request;

            // Kiểm tra đầu vào
            if (request.Barcodes == null || !request.Barcodes.Any())
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Danh sách barcode không được để trống");

            // Lấy giỏ hàng và product details
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.ProductDetail)
                .ThenInclude(pd => pd.Product)
                .ThenInclude(p => p.Promotion)
                .FirstOrDefaultAsync(c => c.Id == request.CartId, cancellationToken);

            if (cart == null || !cart.CartItems.Any())
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Giỏ hàng trống hoặc không tồn tại");

            // Tính tổng số lượng từ CartItems
            var totalCartQuantity = cart.CartItems.Sum(ci => ci.Quantity);

            // Kiểm tra số lượng barcode khớp với tổng Quantity trong giỏ
            if (request.Barcodes.Count != totalCartQuantity)
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    $"Số lượng barcode ({request.Barcodes.Count}) không khớp với tổng số lượng trong giỏ ({totalCartQuantity})");

            // Kiểm tra barcode trùng lặp
            if (request.Barcodes.Distinct().Count() != request.Barcodes.Count)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Danh sách barcode chứa mã trùng lặp");

            // Kiểm tra barcode tồn tại
            var barcodeEntities = await _context.Barcodes
                .Where(b => request.Barcodes.Contains(b.Code))
                .Include(b => b.ProductDetail)
                .ToListAsync(cancellationToken);

            if (barcodeEntities.Count != request.Barcodes.Count)
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Một hoặc nhiều barcode không tồn tại");

            // Kiểm tra barcode đã được sử dụng trong đơn hàng khác
            if (barcodeEntities.Any(b => b.OrderItemId.HasValue))
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Một hoặc nhiều barcode đã được sử dụng trong đơn hàng khác");

            // Kiểm tra barcode thuộc đúng ProductDetail trong giỏ
            var cartProductDetailIds = cart.CartItems.Select(ci => ci.ProductDetailId).ToHashSet();
            var invalidBarcodes = barcodeEntities
                .Where(b => !cartProductDetailIds.Contains(b.ProductDetailId))
                .Select(b => b.Code)
                .ToList();
            if (invalidBarcodes.Any())
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    $"Các barcode {string.Join(", ", invalidBarcodes)} không thuộc sản phẩm trong giỏ hàng");

            // Kiểm tra số lượng barcode theo ProductDetail
            var barcodeCountByProductDetail = barcodeEntities
                .GroupBy(b => b.ProductDetailId)
                .ToDictionary(g => g.Key, g => g.Count());

            foreach (var cartItem in cart.CartItems)
            {
                if (!barcodeCountByProductDetail.TryGetValue(cartItem.ProductDetailId, out var barcodeCount) ||
                    barcodeCount != cartItem.Quantity)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Số lượng barcode ({barcodeCount}) cho ProductDetail {cartItem.ProductDetailId} không khớp với số lượng trong giỏ ({cartItem.Quantity})");
            }

            decimal totalPrice = 0;
            float totalWeight = 0;

            foreach (var item in cart.CartItems)
            {
                var productPrice = item.ProductDetail.Price;

                // Áp dụng khuyến mãi
                if (item.ProductDetail.Product.Promotion != null &&
                    item.ProductDetail.Product.Promotion.IsActive &&
                    DateTime.Now >= item.ProductDetail.Product.Promotion.StartDate &&
                    DateTime.Now <= item.ProductDetail.Product.Promotion.EndDate)
                {
                    productPrice -= productPrice * (item.ProductDetail.Product.Promotion.Discount / 100m);
                }

                if (item.ProductDetail.IsOutOfStock || item.ProductDetail.Quantity < item.Quantity)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Sản phẩm {item.ProductDetail.Product.Name} không đủ hàng");

                totalPrice += productPrice * item.Quantity;
                totalWeight += item.ProductDetail.Weight * item.Quantity;
            }

            // Áp dụng voucher
            if (request.VoucherId.HasValue)
            {
                var voucher = await _context.Vouchers.FindAsync(request.VoucherId.Value, cancellationToken);
                if (voucher == null)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Voucher không tồn tại");

                if (!voucher.IsActive)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Voucher đã hết hạn hoặc không còn hiệu lực");

                if (totalPrice < voucher.MinOrderPrice)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Đơn hàng phải tối thiểu {voucher.MinOrderPrice}đ để sử dụng voucher");

                if (DateTime.Now < voucher.StartDate || DateTime.Now > voucher.EndDate)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Voucher chưa bắt đầu hoặc đã hết hạn");

                if (voucher.Type == VoucherType.Amount)
                {
                    totalPrice -= voucher.DiscountAmount;
                }
                else if (voucher.Type == VoucherType.Percentage)
                {
                    var discount = totalPrice * (voucher.DiscountAmount / 100);
                    if (discount > voucher.MaxDiscountPrice)
                        discount = voucher.MaxDiscountPrice;
                    totalPrice -= discount;
                }
            }

            if (totalPrice < 0) totalPrice = 0;

            // Kiểm tra phương thức thanh toán
            if (request.PaymentMethod != PaymentMethod.COD && request.PaymentMethod != PaymentMethod.BankTransfer)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Phương thức thanh toán không hợp lệ");

            if (request.PaymentMethod == PaymentMethod.COD)
            {
                if (request.CustomerPaid == null || request.CustomerPaid <= 0)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Vui lòng nhập số tiền khách đưa");

                if (request.CustomerPaid < totalPrice)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tiền khách đưa không đủ");
            }

            var store = await _context.Stores.FindAsync(request.StoreId, cancellationToken);
            if (store == null)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy cửa hàng");

            // Tính phí ship
            decimal shippingFee;
            if (request.PaymentMethod == PaymentMethod.COD ||
                request.ShippingAddressId == store.RoomId ||
                request.ShippingAddressId == store.Id)
            {
                shippingFee = 0;
            }
            else
            {
                shippingFee = await _orderDbService.ShippingFeeCharged(
                    request.ShippingAddressId,
                    store.RoomId,
                    (float)totalWeight
                );
            }

            // Khởi tạo Order
            var order = new Order(
                Guid.NewGuid(),
                totalPrice + shippingFee,
                shippingFee,
                request.PaymentMethod,
                request.ShippingAddressId,
                request.UserId,
                cart.CartItems.Select(ci =>
                    new OrderItem(ci.Quantity, ci.ProductDetail.Price, Guid.Empty, ci.ProductDetailId)
                ).ToList(),
                request.VoucherId,
                request.StoreId
            );

            _context.Orders.Add(order);

            // Gán OrderItemId vào Barcodes và liên kết với OrderItem
            var remainingBarcodes = barcodeEntities.ToList();
            foreach (var orderItem in order.Items)
            {
                var productDetailBarcodes = remainingBarcodes
                    .Where(b => b.ProductDetailId == orderItem.ProductDetailId)
                    .Take(orderItem.Quantity)
                    .ToList();

                if (productDetailBarcodes.Count != orderItem.Quantity)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Không đủ barcode cho ProductDetail {orderItem.ProductDetailId}. Cần {orderItem.Quantity} barcode, nhưng chỉ có {productDetailBarcodes.Count}");

                foreach (var barcode in productDetailBarcodes)
                {
                    barcode.OrderItemId = orderItem.ID;
                    orderItem.Barcodes.Add(barcode);
                    remainingBarcodes.Remove(barcode);
                }
            }

            // Kiểm tra xem tất cả barcode đã được sử dụng
            if (remainingBarcodes.Any())
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    $"Các barcode {string.Join(", ", remainingBarcodes.Select(b => b.Code))} không được sử dụng trong đơn hàng");

            // Cập nhật số lượng voucher
            if (request.VoucherId.HasValue)
            {
                var voucher = await _context.Vouchers.FindAsync(request.VoucherId.Value, cancellationToken);
                if (voucher != null)
                {
                    if (voucher.Quantity <= 0)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Voucher đã hết");

                    voucher.Quantity -= 1;
                    voucher.IsActive = voucher.Quantity > 0;
                }
            }

            // Cập nhật số lượng ProductDetail
            foreach (var ci in cart.CartItems)
            {
                var pd = ci.ProductDetail;
                if (pd.IsOutOfStock || pd.Quantity < ci.Quantity)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Sản phẩm {pd.Product.Name} không đủ hàng");

                pd.Quantity -= ci.Quantity;
                pd.Sold += ci.Quantity;

                if (pd.Quantity <= 0)
                {
                    pd.Quantity = 0;
                    pd.IsOutOfStock = true;
                }
            }

            // Xóa giỏ hàng
            _context.Carts.Remove(cart);

            await _context.SaveChangesAsync(cancellationToken);

            // Xử lý thanh toán online
            string paymentUrl = null;
            if (request.PaymentMethod == PaymentMethod.BankTransfer)
            {
                paymentUrl = await _vnPayService.CustomerPay(order.Id);
            }

            return new CreateOrderResponse(true, "Tạo đơn hàng thành công", order.Id, paymentUrl);
        }
    }
}