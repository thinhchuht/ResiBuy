namespace ResiBuy.Server.Infrastructure.Services.UserServices
{
    public class UserService(ResiBuyContext context, UserManager<User> userManager) : IUserService
    {
        public async Task<ResponseModel> GetUserAsync(string userId, string identityNumber = null, string phoneNumber = null, string email = null)
        {
            try
            {
                var query = context.Users.AsQueryable();

                if (!string.IsNullOrEmpty(userId))
                    query = query.Where(u => u.Id == userId);

                if (!string.IsNullOrEmpty(identityNumber))
                    query = query.Where(u => u.IdentityNumber == identityNumber);

                if (!string.IsNullOrEmpty(phoneNumber))
                    query = query.Where(u => u.PhoneNumber == phoneNumber);

                if (!string.IsNullOrEmpty(email))
                    query = query.Where(u => u.Email == email);

                var user = await query.FirstOrDefaultAsync();

                return ResponseModel.SuccessResponse(user);
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }

        public async Task<ResponseModel> CreateUser(RegisterDTO registerDTO)
        {
            try
            {
                var existUser = context.Users.FirstOrDefault(u => u.PhoneNumber == registerDTO.PhoneNumber || u.Email == registerDTO.Email || u.IdentityNumber == registerDTO.IdentityNumber);
                if (existUser == null)
                {
                    var user = new User(registerDTO.IdentityNumber, registerDTO.DateOfBirth, registerDTO.FullName, registerDTO.Roles);

                    var result = await userManager.CreateAsync(user, registerDTO.Password);
                    if (result.Succeeded)
                    {
                        return ResponseModel.SuccessResponse(user);
                    }
                }

                return ResponseModel.FailureResponse("User is already exist");
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }

        }

        public async Task<ResponseModel> GetUserById(string id)
        {
            try
            {
                return ResponseModel.SuccessResponse(await context.Users.FirstOrDefaultAsync(u => u.Id == id));
            }
            catch (Exception ex)
            {
                return ResponseModel.FailureResponse(ex.ToString());
            };
        }
    }
}
