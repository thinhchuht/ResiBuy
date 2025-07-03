namespace ResiBuy.Server.Application.Queries.BuildingQueries
{
    public record GetBuildingByIdQuery(Guid Id) : IRequest<ResponseModel>;

    public class GetBuildingByIdQueryHandler(IBuildingDbService buildingDbService)
        : IRequestHandler<GetBuildingByIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetBuildingByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var building = await buildingDbService.GetByIdAsync(request.Id);

                if (building == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, $"Không tìm thấy tòa nhà với Id: {request.Id}");

                var result = new
                {
                    id = building.Id,
                    name = building.Name,
                    isActive = building.IsActive,
                    areaId = building.AreaId
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