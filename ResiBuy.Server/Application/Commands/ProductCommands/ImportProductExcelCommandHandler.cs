

namespace ResiBuy.Server.Application.Commands.ProductCommands
{
    public record ImportProductExcelCommand(Stream FileStream) : IRequest<ResponseModel>;

    public class ImportProductExcelCommandHandler(IProductDbService productDbService)
        : IRequestHandler<ImportProductExcelCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(ImportProductExcelCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var result = await productDbService.ImportProductsFromExcel(command.FileStream);

                if (result.Errors.Count() > 0)
                    return ResponseModel.FailureResponse("Import sản phẩm thất bại", new
                    {
                        result.Total,
                        result.Success,
                        result.Errors
                    });
                else
                    return ResponseModel.SuccessResponse(new
                    {
                        result.Total,
                        result.Success,
                        result.Errors
                    });
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, $"Import Excel thất bại: {ex.Message}");
            }
        }
    }
}
