namespace ResiBuy.Server.Application.Queries.ShipperQueries
{
    public record GetDistanceQuery(Guid currentArea, Guid destinationArea) : IRequest<ResponseModel>;
    public class GetDistanceQueryHandler(IShipperDbService shipperDbService) : IRequestHandler<GetDistanceQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetDistanceQuery request, CancellationToken cancellationToken)
        {
            if(string.IsNullOrEmpty(request.currentArea.ToString()) || string.IsNullOrEmpty(request.destinationArea.ToString()))
                return ResponseModel.FailureResponse("Current area and destination area are required");
            double distance = await shipperDbService.GetDistance(request.currentArea, request.destinationArea);
            return ResponseModel.SuccessResponse(new
            {
                Distance = distance
            });
        }
    }
}
