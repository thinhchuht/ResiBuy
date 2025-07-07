using ResiBuy.Server.Infrastructure.DbServices.NotificationDbServices;

namespace ResiBuy.Server.Application.Commands.NotificationCommands
{

    public record ReadNotificationCommandCommand(Guid Id, string UserId) : IRequest<ResponseModel>;
    public class  ReadNotificationCommandCommandHandler(IUserDbService userDbService, INotificationDbService notificationDbService) : IRequestHandler< ReadNotificationCommandCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle( ReadNotificationCommandCommand command, CancellationToken cancellationToken)
        {
            try
            {
                if(command.Id == Guid.Empty)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id của thông báo không hợp lệ.");
                if (string.IsNullOrEmpty(command.UserId)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id của người dùng không hợp lệ.");
                var user = await userDbService.GetUserById(command.UserId) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Không tồn tại người dùng");
                await notificationDbService.ReadNotify(command.Id, command.UserId);
                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }

        }
    }
}

