using ResiBuy.Server.Application.Commands.CategoryCommands.DTOs;

namespace ResiBuy.Server.Application.Commands.CategoryCommands
{
    public record UpdateCategoryCommand(UpdateCategoryDto CategoryDto) : IRequest<ResponseModel>;

    public class UpdateCategoryCommandHandler(
        ICategoryDbService categoryDbService,
        IImageDbService imageDbService
    ) : IRequestHandler<UpdateCategoryCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateCategoryCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var dto = command.CategoryDto;

                var category = await categoryDbService.GetByIdAsync(dto.Id);
                if (category == null)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Category {dto.Id} không tồn tại");

                if (string.IsNullOrWhiteSpace(dto.Name))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, $"CategoryName là bắt buộc");
                await categoryDbService.CheckIfExistName(dto.Name);
                category.UpdateCategory(dto.Name, dto.Status);

                if (string.IsNullOrEmpty(dto.Image?.Id))
                {
                    if (category.Image != null)
                    {
                        await imageDbService.DeleteAsync(category.Image);
                        category.Image = null;
                    }
                }
                else
                {

                    if (category.Image == null || category.Image.Id != dto.Image.Id)
                    {
                        if (category.Image != null)
                        {
                            await imageDbService.DeleteAsync(category.Image);
                        }

                        var newImage = new Image();
                        newImage.CreateImage(
                            dto.Image.Id,
                            dto.Image.Url,
                            dto.Image.ThumbUrl,
                            dto.Image.Name
                        );
                        category.Image = newImage;
                    }
                    else
                    {
                        category.Image.UpdateImage(
                            dto.Image.Url,
                            dto.Image.ThumbUrl,
                            dto.Image.Name
                        );
                    }
                }
                var result = await categoryDbService.UpdateAsync(category);
                if (result == null)
                    throw new CustomException(ExceptionErrorCode.UpdateFailed, "Không thể cập nhật Category. Vui lòng kiểm tra lại dữ liệu.");
                return ResponseModel.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }
    }
}

