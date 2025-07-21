using ResiBuy.Server.Infrastructure.DbServices.NotificationDbServices;

namespace ResiBuy.Server.Application.Commands.NotificationCommands
{
    public record ReadAllNotificationsCommand(string UserId) : IRequest<ResponseModel>;
    public class ReadAllNotificationsCommandHandler(IUserDbService userDbService, INotificationDbService notificationDbService) : IRequestHandler<ReadAllNotificationsCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(ReadAllNotificationsCommand command, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(command.UserId)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id của người dùng không hợp lệ.");
            var user = await userDbService.GetUserById(command.UserId) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Không tồn tại người dùng");
            await notificationDbService.ReadAllNotify(command.UserId);
            return ResponseModel.SuccessResponse();
        }
    }
}
