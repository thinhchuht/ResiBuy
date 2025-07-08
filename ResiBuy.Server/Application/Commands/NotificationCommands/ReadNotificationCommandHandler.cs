using ResiBuy.Server.Infrastructure.DbServices.NotificationDbServices;

namespace ResiBuy.Server.Application.Commands.NotificationCommands
{

    public record ReadNotificationCommand(Guid Id, string UserId) : IRequest<ResponseModel>;
    public class  ReadNotificationCommandHandler(IUserDbService userDbService, INotificationDbService notificationDbService) : IRequestHandler< ReadNotificationCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle( ReadNotificationCommand command, CancellationToken cancellationToken)
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

