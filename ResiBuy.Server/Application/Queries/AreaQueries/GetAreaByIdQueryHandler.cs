namespace ResiBuy.Server.Application.Queries.AreaQueries
{
    public record GetAreaByIdQuery(Guid Id) : IRequest<ResponseModel>;

    public class GetAreaByIdQueryHandler(IAreaDbService areaDbService)
        : IRequestHandler<GetAreaByIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAreaByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var area = await areaDbService.GetByIdAsync(request.Id);

                if (area == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, $"Không tìm thấy khu vực với Id: {request.Id}");

                var result = new
                {
                    id = area.Id,
                    name = area.Name,
                    latitude = area.Latitude,
                    longitude = area.Longitude,
                    isActive = area.IsActive
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