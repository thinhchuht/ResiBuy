namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record UpdateUserRoleCommand(string Id, List<string> Roles) : IRequest<ResponseModel>;
    public class UpdateUserRoleCommandHandler(
        IUserDbService userDbService) : IRequestHandler<UpdateUserRoleCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateUserRoleCommand command, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(command.Id) || !command.Roles.Any()) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không có gì để thêm vào");
            if (command.Roles.Contains("ADMIN")) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không được thêm Admin");
            if (!command.Roles.All(role => Constants.AllowedRoles.Contains(role)))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Vai trò người dùng không hợp lệ");
            var existingUser = await userDbService.GetUserById(command.Id);
            if (existingUser == null) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Người dùng không tồn tại");
            if(existingUser.Roles.Contains(Constants.AdminRole)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tài khoản ADMIN không được thêm vai trò khác");
            if (command.Roles == existingUser.Roles) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Người dùng đã sở hữu những vai trò này");
            existingUser.Roles = command.Roles;
            var updatedUser = await userDbService.UpdateAsync(existingUser);
            return ResponseModel.SuccessResponse(updatedUser);
        }
    }
}
 