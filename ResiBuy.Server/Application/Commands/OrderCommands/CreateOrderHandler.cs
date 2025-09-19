
using ResiBuy.Server.Application.Commands.OrderCommands.Dtos;

namespace ResiBuy.Server.Application.Commands.OrderCommands
{
    public record CreateOrder(CreateOrderRequest Request) : IRequest<CreateOrderResponse>;

    public class CreateOrderHandler : IRequestHandler<CreateOrder, CreateOrderResponse>
    {
        private readonly ResiBuyContext _context;
        private readonly IVNPayService _vnPayService;

        public CreateOrderHandler(ResiBuyContext context, IVNPayService vnPayService)
        {
            _context = context;
            _vnPayService = vnPayService;
        }

        public async Task<CreateOrderResponse> Handle(CreateOrder command, CancellationToken cancellationToken)
        {
            var request = command.Request;

            // Lấy giỏ hàng và product details
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.ProductDetail)
                .ThenInclude(pd => pd.Product)
                .ThenInclude(p => p.Promotion)
                .FirstOrDefaultAsync(c => c.Id == request.CartId);

            if (cart == null || !cart.CartItems.Any())
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Giỏ hàng trống hoặc không tồn tại");

            decimal totalPrice = 0;

            foreach (var item in cart.CartItems)
            {
                var productPrice = item.ProductDetail.Price;

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
            }

            // Áp dụng voucher
            if (request.VoucherId.HasValue)
            {
                var voucher = await _context.Vouchers.FindAsync(request.VoucherId.Value);
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

            if (request.PaymentMethod != PaymentMethod.COD && request.PaymentMethod != PaymentMethod.BankTransfer)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Phương thức thanh toán không hợp lệ");

            if (request.PaymentMethod == PaymentMethod.COD)
            {
                if (request.CustomerPaid <= 0)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Vui lòng nhập số tiền khách đưa");

                if (request.CustomerPaid < totalPrice)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tiền khách đưa không đủ");
            }

            var order = new Order(
                Guid.NewGuid(),
                totalPrice,
                request.PaymentMethod,
                request.UserId,
                cart.CartItems.Select(ci =>
                    new OrderItem(ci.Quantity, ci.ProductDetail.Price, Guid.Empty, ci.ProductDetailId)
                ).ToList(), 
                request.VoucherId,
                request.StoreId
            );


            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Xử lý thanh toán online
            string? paymentUrl = null;
            if (request.PaymentMethod == PaymentMethod.BankTransfer)
            {
                paymentUrl = await _vnPayService.CustomerPay(order.Id);
            }

            return new CreateOrderResponse(true, "Tạo đơn hàng thành công", order.Id, paymentUrl);
        }
    }
}
