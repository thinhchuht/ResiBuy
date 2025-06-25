using ResiBuy.Server.Application.Commands.AreaCommands.DTOs;

namespace ResiBuy.Server.Application.Commands.AreaCommands
{
    public record UpdateAreaCommand( UpdateAreaDto UpdateAreaDto) : IRequest<ResponseModel>;

    public class UpdateAreaCommandHandler(IAreaDbService areaDbService, IKafkaProducerService kafkaProducerService, IConfiguration configuration) : IRequestHandler<UpdateAreaCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateAreaCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var dto = command.UpdateAreaDto;

                if (dto == null)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Dũ liệu không để trônhs");
                if (dto.Id == Guid.Empty)
                       throw new CustomException(ExceptionErrorCode.ValidationFailed,"Id là bắt buộc");
                if (string.IsNullOrWhiteSpace(dto.Name))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Name là bắt buộc"); var existingArea = await areaDbService.GetByIdAsync(dto.Id);
                if (existingArea == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, $"Area {dto.Id} không tồn tại");

                existingArea.UpdateArea(dto.Name, dto.IsActive);
                var updateAreaResponse = await areaDbService.UpdateAsync(existingArea);

                return ResponseModel.SuccessResponse(dto);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

    }
}
