using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.DbServices.ReportServices;
using ResiBuy.Server.Infrastructure.Model.EventDataDto;

namespace ResiBuy.Server.Application.Commands.ReportCommands
{
    public record ResolveReportCommand(Guid Id, bool IsAddReportTarget) : IRequest<ResponseModel>;
    public class ResolveReportCommandHandler(IReportDbService reportDbService, IUserDbService userDbService,
        IOrderDbService orderDbService, INotificationService notificationService, 
        IStoreDbService storeDbService, IShipperDbService shipperDbService,
        IMailBaseService mailService) : IRequestHandler<ResolveReportCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(ResolveReportCommand command, CancellationToken cancellationToken)
        {
            var report = await reportDbService.GetByIdBaseAsync(command.Id) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tồn tại báo cáo");
            report.IsResolved = true;
             await reportDbService.UpdateAsync(report);
            var order = await orderDbService.GetById(report.OrderId);
            var lockedUsers = new List<string>();
            var lockedUserMails = new List<string>();
            //order.Status = OrderStatus.Cancelled;
            if (command.IsAddReportTarget)
            {
                if (report.ReportTarget == ReportTarget.Customer)
                {
                    var user = await userDbService.GetUserById(report.TargetId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy người dùng");
                    user.ReportCount += 1;
                    if(user.ReportCount == Constants.MaxReportCount)
                    {
                        user.IsLocked = true;
                        await userDbService.UpdateAsync(user);
                        await notificationService.SendNotificationAsync(Constants.UserLocked,
                            new {UserId = user.Id},
                            Constants.AdminHubGroup, [user.Id], false);
                        lockedUsers.Add(user.Id);
                        lockedUserMails.Add(user.Email);
                    }
                }
                if (report.ReportTarget == ReportTarget.Store)
                {
                    var store = await storeDbService.GetStoreByIdAsync(Guid.Parse(report.TargetId)) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy cửa hàng");
                    store.ReportCount += 1;
                    if (store.ReportCount == Constants.MaxReportCount)
                    {
                        store.IsLocked = true;
                        await storeDbService.UpdateAsync(store);
                        await notificationService.SendNotificationAsync(Constants.UserLocked,
                            new { StoreId = store.Id, StoreName = store.Name },
                            Constants.AdminHubGroup, [store.OwnerId]);
                        lockedUsers.Add(store.OwnerId);
                        lockedUserMails.Add(store.Owner.Email);
                    }
                }
                if (report.ReportTarget == ReportTarget.Shipper)
                {
                    var shipper = await shipperDbService.GetShipperByIdAsync(Guid.Parse(report.TargetId)) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy người dùng");
                    shipper.ReportCount += 1;
                    if (shipper.ReportCount == Constants.MaxReportCount)
                    {
                        shipper.IsLocked = true;
                        await shipperDbService.UpdateAsync(shipper);
                        await notificationService.SendNotificationAsync(Constants.ShipperLocked,
                            new { UserId = shipper.User.Id },
                            Constants.AdminHubGroup, [shipper.User.Id]);
                        lockedUsers.Add(shipper.User.Id);
                        lockedUserMails.Add(shipper.User.Email);
                    }
                }
            }
            //List<string> notiUser = new List<string>();
            List<string> notiUser = new() { report.CreatedById };
            string storeName = "";
            if (report.ReportTarget == ReportTarget.Customer || report.ReportTarget == ReportTarget.Shipper)
            {
                notiUser.Add(report.TargetId);
            }
            else if (report.ReportTarget == ReportTarget.Store)
            {
                notiUser.Add(order.Store.OwnerId);
                storeName = order.Store.Name;
            }
            await notificationService.SendNotificationAsync(Constants.ReportResolved,
                new ResolveReportDto(report.Id, report.OrderId, report.TargetId, command.IsAddReportTarget, report.ReportTarget, storeName),
                Constants.AdminHubGroup, notiUser);

            string htmlBody = BuildLockedAccountEmailBody(report.ReportTarget);
            foreach (var mail in lockedUserMails)
            {
                mailService.SendEmailInAnotherThread(mail,$"Khóa tài khoản", htmlBody);
            }
            return ResponseModel.SuccessResponse();
        }

        private static string BuildLockedAccountEmailBody(ReportTarget target)
        {
            string targetLabel = target switch
            {
                ReportTarget.Customer => "Khách hàng",
                ReportTarget.Store => "Cửa hàng",
                ReportTarget.Shipper => "Người giao hàng",
                _ => "Tài khoản"
            };
            var vi = new CultureInfo("vi-VN");
            var nowLocal = DateTime.Now;
            var nowIso = DateTime.UtcNow.ToString("o");
            string nowLocalText = nowLocal.ToString("HH:mm 'ngày' dd/MM/yyyy", vi);

            return $@"<div style='font-family: Arial, sans-serif; color:#222;'>
                    <h2 style='color:#d32f2f; margin:0 0 8px;'>Khóa {targetLabel}</h2>
                    <p style='font-size:16px; line-height:1.6; margin:8px 0;'>
                     {targetLabel} của bạn đã bị khóa lúc <time datetime='{nowIso}'>{nowLocalText}</time> do vượt quá số lần cảnh cáo.
                    </p>
                    <p style='font-size:16px; line-height:1.6; margin:8px 0;'>
                        Vui lòng liên hệ ban quản lý để được hỗ trợ.
                    </p>
                   </div>";
        }
    }
}
