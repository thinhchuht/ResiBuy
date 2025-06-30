using ResiBuy.Server.Application.Commands.CategoryCommands.DTOs;

namespace ResiBuy.Server.Application.Commands.CategoryCommands
{

    public record CreateCategoryCommand(CreateCategoryDto CategoryDto) : IRequest<ResponseModel>;
    public class CreateCategoryCommandHandler(ICategoryDbService CategoryDbService) : IRequestHandler<CreateCategoryCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateCategoryCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var dto = command.CategoryDto;
             
                if (dto.Name.IsNullOrEmpty()) throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Tên danh mục là bắt buộc");
                var category = new Category(dto.Name, dto.Status);
                if (dto.Image != null && !string.IsNullOrEmpty(dto.Image.Id))
                {
                    var image = new Image();
                    image.CreateImage(
                        dto.Image.Id,
                        dto.Image.Url,
                        dto.Image.ThumbUrl,
                        dto.Image.Name
                    );

                    category.Image = image;

                }
                var createCategory = await CategoryDbService.CreateAsync(category);

                if (createCategory == null)
                    throw new CustomException(ExceptionErrorCode.CreateFailed, "Không thể tạo danh mục mới. Vui lòng kiểm tra lại dữ liệu.");

                return ResponseModel.SuccessResponse(createCategory);
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        } 
    }
}
