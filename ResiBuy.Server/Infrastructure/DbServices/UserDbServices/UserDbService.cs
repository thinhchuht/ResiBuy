using ResiBuy.Server.Exceptions;

namespace ResiBuy.Server.Infrastructure.DbServices.UserDbServices
{
    public class UserDbService : BaseDbService<User>, IUserDbService
    {
        private readonly ResiBuyContext context;
        private readonly RoomDbService roomDbService;

        public UserDbService(ResiBuyContext context, RoomDbService roomDbService) : base(context)
        {
            this.context = context;
            this.roomDbService = roomDbService;
        }

        public async Task<User> GetUserAsync(string userId, string identityNumber = null, string phoneNumber = null, string email = null)
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

            return await query.FirstOrDefaultAsync();
        }

        public async Task<User> CreateUser(RegisterDto registerDto)
        {
            var existUser = context.Users.FirstOrDefault(u => u.PhoneNumber == registerDto.PhoneNumber || u.Email == registerDto.Email || u.IdentityNumber == registerDto.IdentityNumber);
            if (existUser == null)
            {
                var room = await roomDbService.GetBatchAsync(registerDto.RoomIds);
                if (room == null || !room.Any())
                {
                    throw new CustomException(ExceptionErrorCode.CreateFailed, "Can't create user without any room");
                }

                var user = new User(registerDto.PhoneNumber, registerDto.Email, registerDto.IdentityNumber, registerDto.DateOfBirth, registerDto.FullName, registerDto.Roles);
                user.PasswordHash = CustomPasswordHasher.HashPassword(registerDto.Password);

                context.Users.Add(user);
                await context.SaveChangesAsync();

                return user;
            }
            throw new CustomException(ExceptionErrorCode.DuplicateValue, "User with this phone number, email or identity number already exists.");
        }

        public async Task<User> CreateAdminUser(User user)
        {
            context.Users.Add(user);
            await context.SaveChangesAsync();
            return user;
        }

        public async Task<User> GetUserById(string id)
        {
            return await context.Users.Include(u => u.Cart).Include(u => u.UserRooms).ThenInclude(ur => ur.Room).FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<IEnumerable<User>> GetAllUsers()
        {
            return await context.Users.Include(u => u.Cart).Include(u => u.UserRooms).ThenInclude(ur => ur.Room).ToListAsync();
        }
    }
}
