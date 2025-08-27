using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.DbServices.ReportServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.ReportDtos;
using ResiBuy.Server.Infrastructure.Model.EventDataDto;

namespace ResiBuy.Server.Application.Commands.ReportCommands
{
    public record CreateReportCommand(CreateReportDto Dto) : IRequest<ResponseModel>;
    public class CreateReportCommandHandler(IReportDbService reportDbService, IOrderDbService orderDbService,
        IStoreDbService storeDbService, IShipperDbService shipperDbService,
        IUserDbService userDbService, INotificationService notificationService, IMailBaseService mailService) : IRequestHandler<CreateReportCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateReportCommand command, CancellationToken cancellationToken)
        {
            if (command.Dto.ReportTarget == 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu đối tượng báo cáo");

            var user = await userDbService.GetUserById(command.Dto.UserId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tồn tại người dùng");
            if (user.Reports.Where(r => !r.IsResolved).Count() >= 2) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Bạn không thể báo cáo  khi có đơn hàng 2 chưa được giải quyết");
            var order = await orderDbService.GetById(command.Dto.OrderId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tồn tại đơn hàng");
            if (order.Report != null) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Đơn hàng đã bị báo cáo");
            if (command.Dto.UserId == command.Dto.TargetId) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể tự báo cáo chính mình");
            var report = new Report(command.Dto.Title, command.Dto.Description, command.Dto.UserId, command.Dto.ReportTarget, command.Dto.TargetId.ToString(), command.Dto.OrderId);
            var createdReport = await reportDbService.CreateAsync(report);
            order.Status = OrderStatus.Reported;
            if(order.Shipper != null)
            {
                var shipper = await shipperDbService.GetShipperByIdAsync(order.ShipperId.Value);
                if (shipper.IsShipping && shipper.Orders.Where(o => o.Id != order.Id)
                    .All(o => o.Status == OrderStatus.Delivered ||
                              o.Status == OrderStatus.Cancelled ||
                              o.Status == OrderStatus.Reported))
                {
                    shipper.IsShipping = false;
                }
            }
            //order.PaymentStatus = PaymentStatus.Failed;
            await orderDbService.UpdateAsync(order);
            List<string> notiUser = new() { command.Dto.UserId };
            string storeName = "";
            if (command.Dto.ReportTarget == ReportTarget.Customer || command.Dto.ReportTarget == ReportTarget.Shipper)
            {
                notiUser.Add(command.Dto.TargetId);
            }
            else if (command.Dto.ReportTarget == ReportTarget.Store)
            {
                notiUser.Add(order.Store.OwnerId);
                storeName = order.Store.Name;
            }
            await notificationService.SendNotificationAsync(Constants.OrderReported,
                new ReportCreatedDto(createdReport.Id, createdReport.Title, createdReport.Description, createdReport.CreatedAt, createdReport.CreatedById, command.Dto.ReportTarget, createdReport.TargetId, createdReport.OrderId, storeName),
                Constants.AdminHubGroup, notiUser);
            string htmlBody = BuildOrderReportedEmailBody(order.Id, createdReport.Title, createdReport.Description);
            var usersToMail = await userDbService.GetBatchUserById(notiUser);
            foreach (var userToMail in usersToMail)
                mailService.SendEmailInAnotherThread(userToMail.Email, "Đơn hàng bị tố cáo", htmlBody);
            return ResponseModel.SuccessResponse();
        }

        private static string BuildOrderReportedEmailBody(Guid orderId, string? title, string? description)
        {
            var vi = new CultureInfo("vi-VN");
            var nowUtc = DateTime.UtcNow;
            var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"));
            var nowIso = nowUtc.ToString("o");
            string nowLocalText = nowLocal.ToString("HH:mm 'ngày' dd/MM/yyyy", vi);

            var reasonSection = string.Empty;
            if (!string.IsNullOrWhiteSpace(title) || !string.IsNullOrWhiteSpace(description))
            {
                var titleHtml = string.IsNullOrWhiteSpace(title) ? string.Empty :
                    $"<div style='margin:2px 0;'><span style='font-weight:600;'>Tiêu đề:</span> {System.Net.WebUtility.HtmlEncode(title)}</div>";

                var descriptionHtml = string.IsNullOrWhiteSpace(description) ? string.Empty :
                    $"<div style='margin:2px 0; white-space:pre-wrap;'><span style='font-weight:600;'>Mô tả:</span> {System.Net.WebUtility.HtmlEncode(description)}</div>";

                reasonSection = $@"<div style='background:#fafafa; border:1px solid #eee; padding:12px; border-radius:6px; margin:8px 0;'>
                     <div style='font-weight:600; margin-bottom:6px;'>Lý do báo cáo</div>
                      {titleHtml}
                      {descriptionHtml}
                    </div>";
            }

            return $@"<div style='font-family: Arial, sans-serif; color:#222;'>
                    <h2 style='color:#d32f2f; margin:0 0 8px;'>Đơn hàng bị báo cáo</h2>
                    <p style='font-size:16px; line-height:1.6; margin:8px 0;'>
                     Đơn hàng <strong>#{orderId}</strong> đã bị báo cáo lúc <time datetime='{nowIso}'>{nowLocalText}</time>.
                    </p>
                    {reasonSection}
                    <p style='font-size:16px; line-height:1.6; margin:8px 0;'>
                     Vui lòng liên hệ ban quản lý để được hỗ trợ giải quyết.
                     </p>
                    </div>";
        }
    }
}
