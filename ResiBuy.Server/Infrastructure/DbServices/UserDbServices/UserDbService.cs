namespace ResiBuy.Server.Infrastructure.DbServices.UserDbServices
{
    public class UserDbService(ResiBuyContext context) : IUserDbService
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
                //if(!registerDto.Roles.Contains("ADMIN"))
                //{
                    // if (string.IsNullOrEmpty(registerDto.PhoneNumber) || !registerDto.PhoneNumber.All(char.IsDigit))
                    // {
                    //     return ResponseModel.FailureResponse("Phone number must contain only digits");
                    // }

                    // if (string.IsNullOrEmpty(registerDto.Email) || !registerDto.Email.Contains("@") || !registerDto.Email.Contains("."))
                    // {
                    //     return ResponseModel.FailureResponse("Invalid email format");
                    // }

                    // if (string.IsNullOrEmpty(registerDto.Password) || registerDto.Password.Length < 6)
                    // {
                    //     return ResponseModel.FailureResponse("Password must be at least 6 characters long");
                    // }

                    // if (string.IsNullOrEmpty(registerDto.IdentityNumber) || !registerDto.IdentityNumber.All(char.IsDigit) || registerDto.IdentityNumber.Length != 12)
                    // {
                    //     return ResponseModel.FailureResponse("Identity number must be exactly 12 digits");
                    // }
                //}

                var existUser = context.Users.FirstOrDefault(u => u.PhoneNumber == registerDto.PhoneNumber || u.Email == registerDto.Email || u.IdentityNumber == registerDto.IdentityNumber);
                if (existUser == null)
                {
                    var user = new User(registerDto.PhoneNumber, registerDto.Email, registerDto.IdentityNumber, registerDto.DateOfBirth, registerDto.FullName, registerDto.Roles);
                    user.PasswordHash = CustomPasswordHasher.HashPassword(registerDto.Password); // Hash password

                    context.Users.Add(user);
                    await context.SaveChangesAsync();

                    return ResponseModel.SuccessResponse(user);
                }

                return ResponseModel.FailureResponse("User is already exist");
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }

        public async Task<ResponseModel> CreateAdminUser(User user)
        {
            try
            {
                // Note: If you remove Identity completely, CreateAdminUser needs to handle password hashing
                // For now, assuming admin user creation is handled separately or user object already has PasswordHash
                context.Users.Add(user);
                await context.SaveChangesAsync();
                return ResponseModel.SuccessResponse(user);
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
            }
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
            }
        }
    }
}
