namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record LockOrUnlockUserCommand(string Id) : IRequest<ResponseModel>;
    public class LockOrUnlockUserCommandHandler(
        IUserDbService userDbService) : IRequestHandler<LockOrUnlockUserCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(LockOrUnlockUserCommand command, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(command.Id))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không có ID người dùng để thực hiện");

            var existingUser = await userDbService.GetUserById(command.Id);
            if (existingUser == null)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy người dùng");

            if (existingUser.Roles.Contains(Constants.AdminRole))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể khóa tài khoản quản trị viên");

            existingUser.UpdateIsLock();
            var updatedUser = await userDbService.UpdateAsync(existingUser);
            return ResponseModel.SuccessResponse(updatedUser);
        }
    }
}
