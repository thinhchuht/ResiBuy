using ResiBuy.Server.Infrastructure.DbServices.CategoryDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs;

namespace ResiBuy.Server.Application.Commands.CategoryCommands
{

    public record CreateCategoryCommand(CategoryDto CategoryDto) : IRequest<ResponseModel>;
    public class CreateCategoryCommandHandler(ICategoryDbService CategoryDbService) : IRequestHandler<CreateCategoryCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateCategoryCommand command, CancellationToken cancellationToken)
        {
            try
            {
                if (command.CategoryDto.Name.IsNullOrEmpty()) return ResponseModel.FailureResponse("CategoryName is Required");
                var category = new Category
                {
                    Name = command.CategoryDto.Name,
                    Status = command.CategoryDto.Status,
                };
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
