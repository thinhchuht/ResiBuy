using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.StoreDbServices;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ResiBuy.Server.Application.Commands.StoreCommands
{
    public record UpdateStoreCommand(
        Guid Id,
        string Name,
        string Description
    ) : IRequest<ResponseModel>;

    public class UpdateStoreCommandHandler : IRequestHandler<UpdateStoreCommand, ResponseModel>
    {
        private readonly IStoreDbService _storeDbService;

        public UpdateStoreCommandHandler(IStoreDbService storeDbService)
        {
            _storeDbService = storeDbService;
        }

        public async Task<ResponseModel> Handle(UpdateStoreCommand command, CancellationToken cancellationToken)
        {
            // Kiểm tra xem Id có hợp lệ hay không
            if (command.Id == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id không hợp lệ.");
            // Kiểm tra xem cửa hàng có tồn tại hay không
            var store = await _storeDbService.GetStoreByIdAsync(command.Id);
            if (store == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "Cửa hàng không tồn tại.");

            // 2. Cập nhật thông tin cửa hàng
            try
            {
                var store1 = await _storeDbService.GetStoreByIdAsync(command.Id);
                store.Name = command.Name;
                store.Description = command.Description;

                await _storeDbService.UpdateAsync(store1);
                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                // Xử lý lỗi
                throw new CustomException(ExceptionErrorCode.UpdateFailed, $"Không thể cập nhật thông tin cửa hàng: {ex.Message}");
            }
        }
    }
}
