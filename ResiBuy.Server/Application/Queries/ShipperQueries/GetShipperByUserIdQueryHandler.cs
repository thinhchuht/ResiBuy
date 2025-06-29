using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.ShipperDbServices;

namespace ResiBuy.Server.Application.Queries.ShipperQueries
{
    public record GetShipperByUserIdQuery(string UserId) : IRequest<ResponseModel>;

    public class GetShipperByUserIdQueryHandler : IRequestHandler<GetShipperByUserIdQuery, ResponseModel>
    {
        private readonly IShipperDbService _shipperDbService;

        public GetShipperByUserIdQueryHandler(IShipperDbService shipperDbService)
        {
            _shipperDbService = shipperDbService;
        }

        public async Task<ResponseModel> Handle(GetShipperByUserIdQuery query, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(query.UserId))
                throw new CustomException(ExceptionErrorCode.ValidationFailed,"Id người dùng là bắt buộc");

            var shipper = await _shipperDbService.GetShipperByUserIdAsync(query.UserId);
            if (shipper == null)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Shipper không tồn tại");

            return ResponseModel.SuccessResponse(shipper);
        }
    }
} 