using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.DbServices.ReportServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.ReportDtos;
using ResiBuy.Server.Infrastructure.Model.EventDataDto;

namespace ResiBuy.Server.Application.Commands.ReportCommands
{
    public record CreateReportCommand(CreateReportDto Dto) : IRequest<ResponseModel>;
    public class CreateReportCommandHandler(IReportDbService reportDbService, IOrderDbService orderDbService, IUserDbService userDbService, INotificationService notificationService) : IRequestHandler<CreateReportCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateReportCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var user = await userDbService.GetUserById(command.Dto.UserId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tồn tại người dùng");
                var order = await orderDbService.GetById(command.Dto.OrderId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tồn tại đơn hàng");
                var report = new Report(command.Dto.Title, command.Dto.Description, command.Dto.UserId, command.Dto.OrderId);
                var createdReport = await reportDbService.CreateAsync(report);
                await notificationService.SendNotificationAsync(Constants.Refunded, 
                    new ReportCreatedDto(createdReport.Id, createdReport.Title, createdReport.Description, createdReport.CreatedAt, createdReport.CreatedById, createdReport.OrderId),
                    Constants.AdminHubGroup, [order.Store.OwnerId]);
                return ResponseModel.SuccessResponse(createdReport);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
