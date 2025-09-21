using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;
using ResiBuy.Server.Infrastructure.DbServices.ProductDetailDbServices;

namespace ResiBuy.Server.Application.Commands.CartCommands
{
    public record AddToCartByBarcodeCommand(Guid CartId, string Barcode) : IRequest<ResponseModel>;

    public class AddToCartByBarcodeCommandHandler : IRequestHandler<AddToCartByBarcodeCommand, ResponseModel>
    {
        private readonly ICartItemDbService _cartItemDbService;
        private readonly ICartDbService _cartDbService;
        private readonly IProductDetailDbService _productDetailDbService;
        private readonly INotificationService _notificationService;
        private readonly ResiBuyContext _context;

        public AddToCartByBarcodeCommandHandler(
            ICartItemDbService cartItemDbService,
            ICartDbService cartDbService,
            IProductDetailDbService productDetailDbService,
            INotificationService notificationService,
            ResiBuyContext context)
        {
            _cartItemDbService = cartItemDbService;
            _cartDbService = cartDbService;
            _productDetailDbService = productDetailDbService;
            _notificationService = notificationService;
            _context = context;
        }

        public async Task<ResponseModel> Handle(AddToCartByBarcodeCommand command, CancellationToken cancellationToken)
        {
            try
            {
                // Kiểm tra đầu vào
                if (string.IsNullOrWhiteSpace(command.Barcode))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Mã barcode không được để trống");

                // Tìm ProductDetail theo Barcode
                var barcode = await _context.Barcodes
                    .Include(b => b.ProductDetail)
                    .ThenInclude(pd => pd.Product)
                    .ThenInclude(p => p.Category)
                    .Include(b => b.ProductDetail)
                    .ThenInclude(pd => pd.Product)
                    .ThenInclude(p => p.Store)
                    .FirstOrDefaultAsync(b => b.Code == command.Barcode, cancellationToken)
                    ?? throw new CustomException(ExceptionErrorCode.NotFound, "Mã barcode không tồn tại");

                var productDetail = barcode.ProductDetail;
                if (productDetail == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, "Không tìm thấy sản phẩm liên quan đến barcode");

                // Kiểm tra ProductDetail
                if (!productDetail.Product.Category.Status)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Danh mục sản phẩm đã tạm thời ngừng hoạt động");
                if (productDetail.IsOutOfStock || productDetail.Quantity <= 0)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Mặt hàng {productDetail.Product.Name} đã hết hàng");

                // Lấy giỏ hàng
                var cart = await _cartDbService.GetByIdAsync(command.CartId)
                    ?? throw new CustomException(ExceptionErrorCode.NotFound, "Giỏ hàng không tồn tại");

                // Kiểm tra giỏ hàng có UserId = null
                if (cart.UserId != null)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Chỉ có thể thêm sản phẩm vào giỏ hàng không có người dùng (UserId = null)");

                // Kiểm tra xem barcode cụ thể có trong giỏ khác với UserId = null hay không
                var cartsWithNullUser = await _cartDbService.GetCartsInShoppingAsync();
                var otherCartIds = cartsWithNullUser.Where(c => c.Id != command.CartId).Select(c => c.Id).ToList();
              

                // Kiểm tra xem barcode có trong đơn hàng hay không
                if (barcode.OrderItemId.HasValue)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Mã barcode {command.Barcode} đã có trong đơn hàng");

                // Kiểm tra xem giỏ hàng có đang trong quá trình thanh toán
                if (cart.IsCheckingOut)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể thêm sản phẩm khi giỏ hàng đang trong quá trình thanh toán");

                // Kiểm tra xem ProductDetail có trong giỏ hiện tại hay không
                var existingItems = await _cartItemDbService.GetMatchingCartItemsAsync(command.CartId, [productDetail.Id]);
                if (existingItems.Any())
                {
                    // Nếu ProductDetail đã có trong giỏ hiện tại, tăng số lượng
                    var existingItem = existingItems.First();
                    existingItem.Quantity += 1; // Tăng số lượng thêm 1
                    if (existingItem.Quantity > productDetail.Quantity)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Chỉ còn {productDetail.Quantity} sản phẩm có sẵn");
                    if (existingItem.Quantity > 100)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Chỉ được đặt tối đa 100 sản phẩm cùng 1 mặt hàng");

                    await _cartItemDbService.UpdateAsync(existingItem);

                    return ResponseModel.SuccessResponse(new
                    {
                        CartItemId = existingItem.Id,
                        existingItem.Quantity,
                        existingItem.CartId,
                        existingItem.ProductDetail // nếu muốn giữ nguyên
                    });

                }

                // Thêm CartItem mới nếu ProductDetail chưa có trong giỏ
                var cartItem = new CartItem(1, command.CartId, productDetail.Id); // Số lượng mặc định là 1
                if (cartItem.Quantity > productDetail.Quantity)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Chỉ còn {productDetail.Quantity} sản phẩm có sẵn");
                if (cartItem.Quantity > 10)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Chỉ được đặt tối đa 10 sản phẩm cùng 1 mặt hàng");

                await _cartItemDbService.CreateAsync(cartItem);

                return ResponseModel.SuccessResponse(new
                {
                    CartItemId = cartItem.Id,
                    cartItem.Quantity,
                    cartItem.CartId,
                    cartItem.ProductDetail
                });
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }
    }
}