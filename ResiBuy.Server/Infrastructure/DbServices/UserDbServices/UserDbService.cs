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

        public async Task<User> CreateCustomerUser(RegisterDto registerDto)
        {
            var room = await roomDbService.GetBatchAsync(registerDto.RoomIds);
            if (room == null || !room.Any())
            {
                throw new CustomException(ExceptionErrorCode.CreateFailed, "Phòng không tồn tại");
            }
            var user = new User(registerDto.PhoneNumber, registerDto.Email, registerDto.IdentityNumber, registerDto.DateOfBirth, registerDto.FullName, [Constants.CustomerRole]);
            user.Cart = new Cart(user.Id);
            user.UserRooms = registerDto.RoomIds.Select(r => new UserRoom(user.Id, r)).ToList();
            user.PasswordHash = CustomPasswordHasher.HashPassword(registerDto.Password);
            context.Users.Add(user);
            await context.SaveChangesAsync();
            return user;
        }

        public async Task<User> CreateAdminUser(User user)
        {
            try
            {
                context.Users.Add(user);
                await context.SaveChangesAsync();
                return user;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }

        }

        public async Task<User> GetUserById(string id)
        {
            return await context.Users.Include(u => u.Stores).Include(u => u.Reports).Include(u => u.Avatar).Include(u => u.Cart).Include(u => u.UserRooms).ThenInclude(ur => ur.Room).ThenInclude(r => r.Building).ThenInclude(b => b.Area).FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<PagedResult<User>> GetAllUsers(int pageNumber = 1, int pageSize = 10)
        {
            var query = context.Users.AsQueryable();

            var totalCount = await query.CountAsync();
            var users = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = users;

            return new PagedResult<User>(items, totalCount, pageNumber, pageSize);
        }

        public async Task<PagedResult<User>> SearchUsers(string keyword, int pageNumber = 1, int pageSize = 10)
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

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                keyword = keyword.ToLower();
                query = query.Where(u =>
                    u.FullName.ToLower().Contains(keyword) ||
                    u.Email.ToLower().Contains(keyword) ||
                    u.PhoneNumber.Contains(keyword) ||
                    u.IdentityNumber.Contains(keyword)
                );
            }

            // Ensure unique users by distinct on Id
            query = query.Distinct();

            var totalCount = await query.CountAsync();
            var users = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = users;

            return new PagedResult<User>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
        public async Task CheckUniqueField(string userId = null, string phoneNumber = null, string email = null, string identityNumber = null)
        {
            var query = context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(phoneNumber))
            {
                bool exists = await query.AnyAsync(u => u.PhoneNumber == phoneNumber && u.Id != userId);
                if (exists)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số điện thoại đã được sử dụng");
            }

            if (!string.IsNullOrEmpty(email))
            {
                bool exists = await query.AnyAsync(u => u.Email == email && u.Id != userId);
                if (exists)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Mail đã được sử dụng");
            }

            if (!string.IsNullOrEmpty(identityNumber))
            {
                bool exists = await query.AnyAsync(u => u.IdentityNumber == identityNumber && u.Id != userId);
                if (exists)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số CCCD đã được sử dụng");
            }
        }
        public async Task<int> CountAllUsersAsync()
        {
            try
            {
                return await context.Users.CountAsync();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<int> CountLockedUsersAsync()
        {
            try
            {
                return await context.Users.CountAsync(u => u.IsLocked);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<int> SumUserReportCountAsync()
        {
            try
            {
                return await context.Reports.CountAsync(r => !string.IsNullOrEmpty(r.CreatedById));
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
