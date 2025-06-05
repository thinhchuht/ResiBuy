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
                if (user != null) 
                return ResponseModel.SuccessResponse(user);
                return ResponseModel.FailureResponse("User not found");
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }

        public async Task<ResponseModel> CreateUser(RegisterDto registerDto)
        {
            try
            {   
                var existUser = context.Users.FirstOrDefault(u => u.PhoneNumber == registerDto.PhoneNumber || u.UserName == registerDto.UserName || u.Email == registerDto.Email || u.IdentityNumber == registerDto.IdentityNumber);
                if (existUser == null)
                {
                    var user = new User(registerDto.UserName, registerDto.Email, registerDto.IdentityNumber, registerDto.DateOfBirth, registerDto.FullName, registerDto.Roles);

                    var result = await userManager.CreateAsync(user, registerDto.Password);
                    if (result.Succeeded)
                    {
                        return ResponseModel.SuccessResponse(user);
                    }
                    return ResponseModel.FailureResponse(string.Join("; ", result.Errors.Select(e => e.Description)));
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
                return ResponseModel.SuccessResponse(await context.Users.Include(u => u.Cart).Include(u => u.UserRooms).ThenInclude(ur => ur.Room).FirstOrDefaultAsync(u => u.Id == id));
            }
            catch (Exception ex)
            {
                return ResponseModel.FailureResponse(ex.ToString());
            };
        }

        public async Task<ResponseModel> GetAllUsers()
        {
            try
            {
                return ResponseModel.SuccessResponse(await context.Users.Include(u => u.Cart).Include(u => u.UserRooms).ThenInclude(ur => ur.Room).ToListAsync());
            }
            catch (Exception ex)
            {
                return ResponseModel.FailureResponse(ex.ToString());
            };
        }
    }
}
