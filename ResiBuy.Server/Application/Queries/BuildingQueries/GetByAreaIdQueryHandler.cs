namespace ResiBuy.Server.Application.Queries.BuildingQueries
{
    public record GetByAreaIdQuery(Guid Id) : IRequest<ResponseModel>;
    public class GetByAreaIdQueryHandler(IBuildingDbService BuildingDbService) : IRequestHandler<GetByAreaIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetByAreaIdQuery query, CancellationToken cancellationToken)
        {
            try
            {



                var buildings = await BuildingDbService.GetByAreaIdAsync(query.Id);
                return ResponseModel.SuccessResponse(buildings);
            }
            catch (Exception e)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, e.Message);
            }
        }
    }
}
