
namespace ResiBuy.Server.Infrastructure.DbServices.BuildingDbServices
{
    public class BuildingDbService : BaseDbService<Building>, IBuildingDbService
    {
        private readonly ResiBuyContext context;
        private readonly IAreaDbService areaDbService;

        public BuildingDbService(ResiBuyContext context, IAreaDbService areaDbService) : base(context)
        {
            this.context = context;
            this.areaDbService = areaDbService;
        }

        public async Task<bool> IsNameExistsAsync(string name, Guid areaId)
        {
            return await context.Buildings.AnyAsync(b => b.Name == name && b.AreaId == areaId);
        }

        public async Task<Building> CreateAsync(string name, Guid areaId)
        {
            try
            {
                if (string.IsNullOrEmpty(name))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tên tòa nhà là bắt buộc");

                if (await IsNameExistsAsync(name, areaId))
                    throw new CustomException(ExceptionErrorCode.DuplicateValue, $"Tòa nhà với tên {name} đã tồn tại trong khu vực");

                var area = await areaDbService.GetByIdAsync(areaId)
                    ?? throw new CustomException(ExceptionErrorCode.NotFound, "Khu vực không tồn tại");

                var building = new Building
                {
                    Name = name,
                    AreaId = areaId,
                    IsActive = true,
                };
                await context.Buildings.AddAsync(building);
                await context.SaveChangesAsync();
                return building;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<IEnumerable<Building>> GetAllAsync()
        {
            try
            {
                var query = context.Buildings.Include(a => a.Rooms).AsQueryable();
                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<Building> GetBuildingByNameAndAreaIdAssync(string name, Guid areaId)
        {
            var building = await context.Buildings.FirstOrDefaultAsync(b => b.Name == name && b.AreaId == areaId);
            if (building == null) return null;
            return building;
        }

        public async Task<IEnumerable<Building>> GetByAreaIdAsync(Guid id, bool getActive)
        {
            try
            {
                var query = context.Buildings.Where(b => b.AreaId == id).AsQueryable();
                if (getActive)
                    query = query.Where(b => b.IsActive);
                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<Building> GetByIdAsync(Guid id)
        {
            try
            {
                return await context.Buildings.Include(b =>b.Area).Include(a => a.Rooms).ThenInclude(r=>r.Stores).FirstOrDefaultAsync(b => b.Id == id);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<int> CountAsync()
        {
            try
            {
                return await context.Buildings.CountAsync();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}