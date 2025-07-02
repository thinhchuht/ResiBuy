using Microsoft.EntityFrameworkCore.Update.Internal;
using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.StoreDbServices;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ResiBuy.Server.Application.Commands.StoreCommands
{
    public record UpdateStoreStatusCommand(
        Guid StoreId,
        bool IsLocked,
        bool IsOpen
    ) : IRequest<ResponseModel>;

    public class UpdateStoreStatusCommandHandler : IRequestHandler<UpdateStoreStatusCommand, ResponseModel>
    {
        private readonly IStoreDbService _storeDbService;

        public UpdateStoreStatusCommandHandler(IStoreDbService storeDbService)
        {
            _storeDbService = storeDbService;
        }
        public async Task<ResponseModel> Handle(UpdateStoreStatusCommand command, CancellationToken cancellationToken)
        {
            // Kiểm tra xem Id có hợp lệ hay không
            if (command.StoreId == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id của cửa hàng không hợp lệ.");
            // Kiểm tra xem cửa hàng có tồn tại hay không
            var store = await _storeDbService.GetStoreByIdAsync(command.StoreId);
            if (store == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "Cửa hàng không tồn tại.");
            // 2. Cập nhật trạng thái cửa hàng
            try
            {
                await _storeDbService.UpdateStoreStatusAsync(command.StoreId, command.IsLocked, command.IsOpen);
                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                // Xử lý lỗi
                throw new CustomException(ExceptionErrorCode.UpdateFailed, $"Không thể cập nhật trạng thái cửa hàng: {ex.Message}");
            }
        }

        
    }
}
