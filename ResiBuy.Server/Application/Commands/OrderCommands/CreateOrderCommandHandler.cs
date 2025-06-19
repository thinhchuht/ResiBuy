using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;
using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.DbServices.OrderItemDbServices;

namespace ResiBuy.Server.Application.Commands.OrderCommands
{
    public record CreateOrderCommand(CheckoutDto CheckoutDto) : IRequest<ResponseModel>;
    public class CreateOrderCommandHandler(IUserDbService userDbService, IOrderDbService orderDbService, IRoomDbService roomDbService,
        IOrderItemDbService orderItemDbService, ICartDbService cartDbService, ICartItemDbService cartItemDbService,
        IMailBaseService mailBaseService, INotificationService notificationService
        ) : IRequestHandler<CreateOrderCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            var dto = request.CheckoutDto;
            if(dto.UserId == null ) throw new CustomException(ExceptionErrorCode.ValidationFailed, "UserId không được để trống");
            if(dto.GrandTotal < 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tổng tiền không được nhỏ hơn 0");
            if (dto.Orders == null || !dto.Orders.Any()) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không có đơn hàng nào để tạo");
            if (dto.Orders.Any(o => o.TotalPrice < 0))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tổng tiền của đơn hàng không được nhỏ hơn 0");
            if (dto.Orders.Any(o => !o.Items.Any()) || dto.Orders.Any(o => o.Items.Any(i => i.Quantity <= 0 || i.Price < 0)))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Đơn hàng phải có sản phẩm và số lượng phải lớn hơn 0");
            var room = await roomDbService.GetByIdBaseAsync(dto.AddressId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Phòng không tồn tại");
            var user = await userDbService.GetUserById(dto.UserId);
            if (user == null) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Người dùng không tồn tại");
            if(!user.Roles.Contains(Constants.CustomerRole)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Chỉ có người mua mới tạo được đơn hàng.");
            if (user.Cart == null)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Giỏ hàng không có sản phẩm nào.");
            var cart = await cartDbService.GetByIdAsync(user.Cart.Id);
            if(!cart.CartItems.Any()) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Giỏ hàng không có sản phẩm nào.");
            var orders = dto.Orders.Select(o => new Order(o.Id, o.TotalPrice, dto.PaymentMethod, o.Note, dto.AddressId, dto.UserId, o.StoreId));
            var createdOrders = await orderDbService.CreateBatchAsync(orders);
            if(createdOrders == null || !createdOrders.Any()) throw new CustomException(ExceptionErrorCode.CreateFailed, "Không thể tạo đơn hàng");
            var orderItems = dto.Orders.SelectMany((o) => o.Items.Select(i => new OrderItem(i.Quantity,i.Price,o.Id, i.ProductDetailId)));
            var createdOrderItems = await orderItemDbService.CreateBatchAsync(orderItems);
            if (!createdOrderItems.Any()) throw new CustomException(ExceptionErrorCode.CreateFailed, "Không tạo được sản phẩm trong đơn hàng");
             await cartItemDbService.DeleteBatchByProductDetailIdAsync(cart.Id ,createdOrderItems.Select(ci => ci.ProductDetailId));
            //mailBaseService.SendEmailAsync(user.Email, "Hóa đơn thanh toán đơn hà ResiBuy",);
            return ResponseModel.SuccessResponse();
        }
    }
}
