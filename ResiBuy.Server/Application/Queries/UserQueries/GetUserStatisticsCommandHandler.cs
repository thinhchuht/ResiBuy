namespace ResiBuy.Server.Application.Queries.UserQueries
{
    public record GetUserStatisticsCommand() : IRequest<ResponseModel>;
    public class GetUserStatisticsCommandHandler(IUserDbService userDbService)
         : IRequestHandler<GetUserStatisticsCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetUserStatisticsCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var users = await userDbService.GetAllUsers(); 
                var totalUsers = users.TotalCount;
                var lockedUsers = users.Items.Count(u => u.IsLocked);

                var totalReports = users.Items.Sum(u => u.ReportCount);

                var result = new
                {
                    TotalUsers = totalUsers,
                    LockedUsers = lockedUsers,
                    TotalReportCount = totalReports
                };

                return ResponseModel.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}