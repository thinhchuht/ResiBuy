using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.DbServices.ReportServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.ReportDtos;
using ResiBuy.Server.Infrastructure.Model.EventDataDto;

namespace ResiBuy.Server.Application.Commands.ReportCommands
{
    public record CreateReportCommand(CreateReportDto Dto) : IRequest<ResponseModel>;
    public class CreateReportCommandHandler(IReportDbService reportDbService, IOrderDbService orderDbService, IUserDbService userDbService, INotificationService notificationService, IMailBaseService mailService) : IRequestHandler<CreateReportCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateReportCommand command, CancellationToken cancellationToken)
        {
            if (command.Dto.ReportTarget == 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu đối tượng báo cáo");
            var user = await userDbService.GetUserById(command.Dto.UserId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tồn tại người dùng");
            var order = await orderDbService.GetById(command.Dto.OrderId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tồn tại đơn hàng");
            if(order.Report != null) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Đơn hàng đã bị báo cáo");
            if (command.Dto.UserId == command.Dto.TargetId) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể tự báo cáo chính mình");
            var report = new Report(command.Dto.Title, command.Dto.Description, command.Dto.UserId, command.Dto.ReportTarget, command.Dto.TargetId.ToString(), command.Dto.OrderId);
            var createdReport = await reportDbService.CreateAsync(report);
            order.Status = OrderStatus.Reported;
            order.PaymentStatus = PaymentStatus.Failed;
            await orderDbService.UpdateAsync(order);
            //List<string> notiUser = new List<string>();
            await notificationService.SendNotificationAsync(Constants.OrderReported,
                new ReportCreatedDto(createdReport.Id, createdReport.Title, createdReport.Description, createdReport.CreatedAt, createdReport.CreatedById, command.Dto.ReportTarget, createdReport.TargetId, createdReport.OrderId),
                Constants.AdminHubGroup, [createdReport.TargetId, createdReport.CreatedById]);
            //await mailService.SendEmailAsync();
            return ResponseModel.SuccessResponse();
        }
    }
}
