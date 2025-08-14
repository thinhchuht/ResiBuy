using ClosedXML.Excel;

namespace ResiBuy.Server.Common
{
    public class UserChecker
    {
        public static ResponseModel CheckUserInExcel(string identityNumber, string fullName, DateTime dateOfBirth)
        {
            using var workbook = new XLWorkbook("Assets/Resident.xlsx") ?? throw new CustomException(ExceptionErrorCode.NotFound, "Không thể tìm thấy danh sách cư dân, hãy liên hệ ban quản lý tòa nhà để được làm việc");
            var worksheet = workbook.Worksheet(1);

            foreach (var row in worksheet.RowsUsed().Skip(1))
            {
                var excelIdentity = row.Cell(1).GetValue<string>().Trim();
                var excelFullName = row.Cell(2).GetValue<string>().Trim();
                var excelBirthDate = row.Cell(3).GetValue<string>().Trim();
                if (excelIdentity.Length == 11 && !excelIdentity.StartsWith("0"))
                    excelIdentity = "0" + excelIdentity;
                if (excelIdentity == identityNumber &&
                    excelFullName.Equals(fullName, StringComparison.OrdinalIgnoreCase) &&
                    excelBirthDate == dateOfBirth.ToString("dd/MM/yyyy"))
                {
                    return ResponseModel.SuccessResponse();
                }
            }
            throw new CustomException(ExceptionErrorCode.CreateFailed, "Không tồn tại người dùng");
        }
    }
}
