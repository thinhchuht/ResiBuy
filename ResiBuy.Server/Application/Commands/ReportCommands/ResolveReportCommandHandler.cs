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
            var order = await orderDbService.GetByIdBaseAsync(report.OrderId);
            order.Status = OrderStatus.Cancelled;
            if(command.IsAddReportTarget)
            {
                if (report.ReportTarget == ReportTarget.Customer)
                {
                    var user = await userDbService.GetUserById(report.TargetId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy người dùng");
                    user.ReportCount += 1;
                    if(user.ReportCount == Constants.MaxReportCount)
                    {
                        user.IsLocked = true;
                        await userDbService.UpdateAsync(user);
                    }
                }
                if (report.ReportTarget == ReportTarget.Store)
                {
                    var store = await storeDbService.GetByIdBaseAsync(Guid.Parse(report.TargetId)) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy cửa hàng");
                    store.ReportCount += 1;
                    if (store.ReportCount == Constants.MaxReportCount)
                    {
                        store.IsLocked = true;
                        await storeDbService.UpdateAsync(store);
                    }
                }
                if (report.ReportTarget == ReportTarget.Shipper)
                {
                    var shipper = await shipperDbService.GetByIdBaseAsync(Guid.Parse(report.TargetId)) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy người dùng");
                    shipper.ReportCount += 1;
                    if (shipper.ReportCount == Constants.MaxReportCount)
                    {
                        shipper.IsLocked = true;
                        await shipperDbService.UpdateAsync(shipper);
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
            //await mailService.SendEmailAsync();
            return ResponseModel.SuccessResponse();
        }
    }
}
