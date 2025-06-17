using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;
using ResiBuy.Server.Infrastructure.Model.DTOs.CartDtos;

namespace ResiBuy.Server.Application.Commands.CartCommands
{
    public record AddToCartCommand(Guid Id, AddToCartDto AddToCartDto) : IRequest<ResponseModel>;
    public class AddToCartCommandHandler(ICartItemDbService cartItemDbService, ICartDbService cartDbService,
        IBaseDbService<Product> baseProductDbService, IBaseDbService<CostData> baseCostDataDbService, IBaseDbService<UncostData> baseUncostDataDbService
        ) : IRequestHandler<AddToCartCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(AddToCartCommand command, CancellationToken cancellationToken)
        {
            try
            {
                if (command.Id == Guid.Empty) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu mã giỏ hàng");
                if (command.AddToCartDto.Quantity <= 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số lượng phải là lớn hơn 0");
                if (command.AddToCartDto.ProductId == Guid.Empty) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu mã sản phẩm");
                if (command.AddToCartDto.CostDataId == Guid.Empty) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu phân loại sản phẩm");
                var product = await baseProductDbService.GetByIdBaseAsync(command.AddToCartDto.ProductId) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Sản phẩm không tồn tại");
                if (product.IsOutOfStock) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Sản phẩm đã hết hàng");
                var costData = await baseCostDataDbService.GetByIdBaseAsync(command.AddToCartDto.CostDataId) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Phân loại sản phẩm không tồn tại");
                if (costData.ProductId != command.AddToCartDto.ProductId)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Phân loại sản phẩm không thuộc về sản phẩm này");
                if (costData.IsOutOfStock) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Phân loại sản phẩm đã hết hàng");
                var uncostDataList = new List<UncostData>();
                foreach (var id in command.AddToCartDto.UncostDataIds)
                {
                    var uncost = await baseUncostDataDbService.GetByIdBaseAsync(id)
                        ?? throw new CustomException(ExceptionErrorCode.NotFound, $"Phân loại không tính giá (ID: {id}) không tồn tại");

                    if (uncost.CostDataId != command.AddToCartDto.CostDataId)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Phân loại {uncost.Key} - {uncost.Value} không thuộc CostData đã chọn");

                    if (uncost.IsOutOfStock)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Phân loại {uncost.Key} - {uncost.Value} đã hết hàng");

                    uncostDataList.Add(uncost);
                }
                if (uncostDataList.GroupBy(s => s.Key).Any(g => g.Count() > 1))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không được chọn 2 phân loại giống nhau.");
                var cart = await cartDbService.GetByIdAsync(command.Id) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Giỏ hàng không tồn tại");
                var existingItem = await cartItemDbService.GetMatchingCartItemsAsync(command.Id, command.AddToCartDto.ProductId, command.AddToCartDto.CostDataId, command.AddToCartDto.UncostDataIds);
                if (existingItem != null)
                {
                    existingItem.Quantity = command.AddToCartDto.IsAdd ? existingItem.Quantity + command.AddToCartDto.Quantity : command.AddToCartDto.Quantity;
                    if (existingItem.Quantity > 10)
                    {
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Chỉ được đặt tối đa 10 sản phẩm cùng 1 mặt hàng");
                    }
                    await cartItemDbService.UpdateAsync(existingItem);
                    return ResponseModel.SuccessResponse(existingItem);
                }

                var cartItem = new CartItem(command.AddToCartDto.Quantity, command.Id, command.AddToCartDto.ProductId)
                {
                    CostDataId = command.AddToCartDto.CostDataId,
                    CartItemUncosts = command.AddToCartDto.UncostDataIds
                    .Select(id => new CartItemUncost { UncostDataId = id })
                    .ToList()
                };
                await cartItemDbService.CreateAsync(cartItem);
                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }
    }
}
