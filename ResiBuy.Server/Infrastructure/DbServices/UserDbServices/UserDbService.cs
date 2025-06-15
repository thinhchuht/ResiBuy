using ResiBuy.Server.Infrastructure.Filter;

namespace ResiBuy.Server.Infrastructure.DbServices.UserDbServices
{
    public class UserDbService : BaseDbService<User>, IUserDbService
    {
        private readonly ResiBuyContext context;
        private readonly IRoomDbService roomDbService;

        public UserDbService(ResiBuyContext context, IRoomDbService roomDbService) : base(context)
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
            return await context.Users.Include(u => u.Avatar).Include(u => u.Cart).Include(u => u.UserRooms).ThenInclude(ur => ur.Room).ThenInclude(r => r.Building).ThenInclude(b => b.Area).FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<PagedResult<UserQueryResult>> GetAllUsers(int pageNumber = 1, int pageSize = 10)
        {
            var query = context.Users
                .Include(u => u.Avatar)
                .Include(u => u.Cart)
                .Include(u => u.UserRooms)
                .ThenInclude(ur => ur.Room)
                .ThenInclude(r => r.Building)
                .ThenInclude(b => b.Area)
                .Include(u => u.UserVouchers)
                .Include(u => u.Reports)
                .AsQueryable();

            var totalCount = await query.CountAsync();
            var users = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = users.Select(user => new UserQueryResult(
                user.Id,
                user.Email,
                user.DateOfBirth,
                user.IsLocked,
                user.Roles,
                user.FullName,
                user.CreatedAt,
                user.UpdatedAt,
                user.Cart?.Id ?? null,
                user.Avatar != null ? new AvatarQueryResult(
                    user.Avatar.Id,
                    user.Avatar.Name,
                    user.Avatar.ImgUrl,
                    user.Avatar.ThumbUrl) : null,
                user.UserRooms.Select(ur => new RoomQueryResult(
                    ur.RoomId,
                    ur.Room?.Name,
                    ur.Room?.Building.Name,
                    ur.Room?.Building.Area.Name)),
                user.UserVouchers.Select(uv => uv.VoucherId),
                user.Reports.ToList()
            )).ToList();

            return new PagedResult<UserQueryResult>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
    }
}
