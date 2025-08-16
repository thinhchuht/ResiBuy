using DocumentFormat.OpenXml.Wordprocessing;
using ResiBuy.Server.Application.Queries.ShipperQueries.DTOs;

namespace ResiBuy.Server.Application.Queries.ShipperQueries
{
    public record GetTimeSheetsQuery(Guid ShipperId, DateTime? StartDate, DateTime? EndDate)
     : IRequest<ResponseModel>;

    public class GetTimeSheetsQueryHandler
        : IRequestHandler<GetTimeSheetsQuery, ResponseModel>
    {
        private readonly IShipperDbService _shipperDbService;

        public GetTimeSheetsQueryHandler(IShipperDbService shipperDbService)
        {
            _shipperDbService = shipperDbService;
        }

        public async Task<ResponseModel> Handle(GetTimeSheetsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var summary = await _shipperDbService.GetTimeSheetSummaryAsync(
                    request.ShipperId,
                    request.StartDate,
                    request.EndDate
                );

                return ResponseModel.SuccessResponse(summary);
            }
            catch (CustomException ex)
            {
                return ResponseModel.FailureResponse(ex.Message);
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.Message);
            }
        }
    }



}
