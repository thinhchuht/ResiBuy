namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record ChangePasswordCommand(string Id, string Code) : IRequest<ResponseModel>;
    public class ChangePasswordCommandHandler(
        IUserDbService userDbService, ICodeGeneratorSerivce codeGeneratorSerivce) : IRequestHandler<ChangePasswordCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(ChangePasswordCommand command, CancellationToken cancellationToken)
        {
            var rs = codeGeneratorSerivce.TryGetCachedData<ChangePasswordDto>(command.Code, out var changePasswordDto);
            if (!rs) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Mã xác nhận sai hoặc đã hết hạn");
            var existingUser = await userDbService.GetUserById(command.Id);
            if (existingUser == null) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Người dùng không tồn tại");
            if (existingUser.Roles.Contains("ADMIN")) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không được đổi mật khẩu Admin");
            var result = CustomPasswordHasher.VerifyPassword(changePasswordDto.OldPassword, existingUser.PasswordHash);
            if(!result)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Mật khẩu hiện tại không đúng");
            existingUser.PasswordHash = CustomPasswordHasher.HashPassword(changePasswordDto.NewPassword);
            var updatedUser = await userDbService.UpdateAsync(existingUser);
            return ResponseModel.SuccessResponse(updatedUser);
        }
    }
}
