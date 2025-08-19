using ResiBuy.Server.Infrastructure.DbServices.VoucherDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.VoucherDtos;

namespace ResiBuy.Server.Application.Commands.VoucherCommands
{
    public record UpdateVoucherCommand(UpdateVoucherDto UpdateQuantityVoucherDto) : IRequest<ResponseModel>;
    public class UpdateVoucherCommandHandler(IVoucherDbService voucherDbService) : IRequestHandler<UpdateVoucherCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateVoucherCommand command, CancellationToken cancellationToken)
        {
            var dto = command.UpdateQuantityVoucherDto;
            if (dto.Quantity <= 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số lượng voucher phải lớn hơn 0");
            var voucher = await voucherDbService.GetByIdBaseAsync(dto.Id) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy voucher");
            if (voucher.IsActive) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Voucher đang hoạt động, không thể sửa.");
            if (voucher.StoreId != dto.StoreId) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Bạn không có quyền sửa đổi voucher này");
            if (dto.DiscountAmount <= 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số tiền giảm phải lớn hơn 0");
            if (dto.MinOrderPrice < 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Giá đơn tối thiểu không được nhỏ hơn 0");
            if (dto.MaxDiscountPrice < 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Giá giảm tối đa không được nhỏ hơn 0");
            if (dto.StartDate.Date < DateTime.Now.Date)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Ngày bắt đầu phải sau thời điểm hiện tại");
            if (dto.StartDate.Date >= dto.EndDate.Date)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Ngày bắt đầu phải trước ngày kết thúc");
            voucher.UpdateQuantity(dto.Quantity);
            voucher.DiscountAmount = dto.DiscountAmount;
            voucher.MaxDiscountPrice = dto.MaxDiscountPrice;
            voucher.MinOrderPrice = dto.MinOrderPrice;
            voucher.StartDate = dto.StartDate;
            voucher.EndDate = dto.EndDate;
            var updatedVoucher = await voucherDbService.UpdateAsync(voucher);
            return ResponseModel.SuccessResponse(updatedVoucher);
        }
    }
}
