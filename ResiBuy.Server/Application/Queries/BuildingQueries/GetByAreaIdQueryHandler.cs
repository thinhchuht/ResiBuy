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
                var result = buildings.Select(b => new
                {
                    id = b.Id,
                    name = b.Name,
                    isActive = b.IsActive,
                  

                }).ToList();
                return ResponseModel.SuccessResponse(result);
            }
            catch (Exception e)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, e.Message);
            }
        }
    }
}
