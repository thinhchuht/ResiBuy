using ClosedXML.Excel;

namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record ImportResidentExcelCommand(IFormFile File) : IRequest<ResponseModel>;
    public class ImportResidentExcelCommandHandler(IWebHostEnvironment environment) : IRequestHandler<ImportResidentExcelCommand, ResponseModel>
    {
        private readonly string[] ExpectedHeaders = ["CCCD", "Họ và tên", "Ngày sinh"];
        public async Task<ResponseModel> Handle(ImportResidentExcelCommand request, CancellationToken cancellationToken)
        {
            if (request.File == null || request.File.Length == 0)
                throw new CustomException(ExceptionErrorCode.NotFound, "Vui lòng chọn file Excel để tải lên");
            var fileExtension = Path.GetExtension(request.File.FileName).ToLower();
            if (fileExtension != ".xlsx" && fileExtension != ".xls")
                throw new CustomException(ExceptionErrorCode.InvalidInput, "Chỉ chấp nhận file Excel (.xlsx, .xls)");

            var assetsPath = Path.Combine(environment.ContentRootPath, "Assets");
            if (!Directory.Exists(assetsPath))
                Directory.CreateDirectory(assetsPath);

            var tempFilePath = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName() + fileExtension);
            using (var stream = new FileStream(tempFilePath, FileMode.Create))
                await request.File.CopyToAsync(stream);
            try
            {
                ValidateExcelFile(tempFilePath);
                var targetPath = Path.Combine(assetsPath, "Resident.xlsx");
                if (File.Exists(targetPath))
                {
                    File.Delete(targetPath);
                }
                File.Move(tempFilePath, targetPath);

                return ResponseModel.SuccessResponse();
            }
            finally
            {
                if (File.Exists(tempFilePath))
                    File.Delete(tempFilePath);
            }
        }

        private void ValidateExcelFile(string filePath)
        {
            using var workbook = new XLWorkbook(filePath);
            var worksheet = workbook.Worksheet(1);
            var firstRow = worksheet.FirstRowUsed();
            if (firstRow == null)
                throw new CustomException(ExceptionErrorCode.InvalidInput, "File Excel không có dữ liệu");
            var headers = firstRow.Cells().Select(c => c.GetValue<string>()?.Trim()).ToArray();

            if (headers.Length < ExpectedHeaders.Length)
                throw new CustomException(ExceptionErrorCode.InvalidInput, "Số lượng cột không đúng");
            for (int i = 0; i < ExpectedHeaders.Length; i++)
            {
                if (!string.Equals(headers[i], ExpectedHeaders[i], StringComparison.OrdinalIgnoreCase))
                {
                    throw new CustomException(ExceptionErrorCode.InvalidInput, $"Cột thứ {i + 1} phải là '{ExpectedHeaders[i]}'");
                }
            }
        }
    }
}
