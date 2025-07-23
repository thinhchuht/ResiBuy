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

            var result = new
            {
                shipper.Id,
                shipper.IsOnline,
                shipper.IsShipping,
                shipper.ReportCount,
                shipper.StartWorkTime,
                shipper.EndWorkTime,
                shipper.LastLocationId,
                shipper.LastDelivered,
                LastLocationName = shipper.LastLocation?.Name,

                Email = shipper.User?.Email,
                PhoneNumber = shipper.User?.PhoneNumber,
                IdentityNumber = shipper.User?.IdentityNumber,
                DateOfBirth = shipper.User?.DateOfBirth,
                IsLocked = shipper.User?.IsLocked,
                FullName = shipper.User?.FullName,
                CreatedAt = shipper.User?.CreatedAt,
                UpdatedAt = shipper.User?.UpdatedAt
            };

            return ResponseModel.SuccessResponse(result);
        }
    }
} 