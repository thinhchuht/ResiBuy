using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.ShipperDbServices;

namespace ResiBuy.Server.Application.Queries.ShipperQueries
{
    public record GetShipperByIdQuery(Guid Id) : IRequest<ResponseModel>;

    public class GetShipperByIdQueryHandler : IRequestHandler<GetShipperByIdQuery, ResponseModel>
    {
        private readonly IShipperDbService _shipperDbService;

        public GetShipperByIdQueryHandler(IShipperDbService shipperDbService)
        {
            _shipperDbService = shipperDbService;
        }

        public async Task<ResponseModel> Handle(GetShipperByIdQuery query, CancellationToken cancellationToken)
        {
            if (query.Id == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "ShipperId là bắt buộc");

            var shipper = await _shipperDbService.GetShipperByIdAsync(query.Id);
            if (shipper == null)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Shipper không tồn tại");

            return ResponseModel.SuccessResponse(shipper);
        }
    }
} 