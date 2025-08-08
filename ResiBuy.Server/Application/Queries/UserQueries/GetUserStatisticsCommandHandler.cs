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
                var totalUsers = await userDbService.CountAllUsersAsync();
                var lockedUsers = await userDbService.CountLockedUsersAsync();
                var totalReportCount = await userDbService.SumUserReportCountAsync();

                var result = new
                {
                    TotalUsers = totalUsers,
                    LockedUsers = lockedUsers,
                    TotalReportCount = totalReportCount
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