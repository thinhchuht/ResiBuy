using ResiBuy.Server.Application.Commands.CategoryCommands.DTOs;
using ResiBuy.Server.Infrastructure.DbServices.CategoryDbServices;

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
                if (dto.Name.IsNullOrEmpty()) return ResponseModel.FailureResponse("CategoryName is Required");
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
                return ResponseModel.SuccessResponse(createCategory);
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        } 
    }
}
