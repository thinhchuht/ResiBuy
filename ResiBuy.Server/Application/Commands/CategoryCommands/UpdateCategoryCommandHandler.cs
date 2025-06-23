using ResiBuy.Server.Application.Commands.CategoryCommands.DTOs;

namespace ResiBuy.Server.Application.Commands.CategoryCommands
{
    public record UpdateCategoryCommand(UpdateCategoryDto CategoryDto) : IRequest<ResponseModel>;

    public class UpdateCategoryCommandHandler(
        ICategoryDbService CategoryDbService,
        IImageDbService imageDbService
    ) : IRequestHandler<UpdateCategoryCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateCategoryCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var dto = command.CategoryDto;

                var category = await CategoryDbService.GetByIdAsync(dto.Id);
                if (category == null)
                    return ResponseModel.FailureResponse($"Category {dto.Id} không tồn tại");

                if (string.IsNullOrWhiteSpace(dto.Name))
                    return ResponseModel.FailureResponse("Category name is required");

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
                var result = await CategoryDbService.UpdateAsync(category);

                return ResponseModel.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }
    }
}

