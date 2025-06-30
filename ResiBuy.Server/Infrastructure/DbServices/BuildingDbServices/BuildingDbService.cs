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

        public async Task<Building> CreateAsync(string name, Guid areaId)
        {
            try
            {
                if (string.IsNullOrEmpty(name)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tên tòa nhà là bắt buộc");
                var existBuilding = await GetBuildingByNameAndAreaIdAssync(name, areaId);
                if (existBuilding != null)
                {
                    throw new CustomException(ExceptionErrorCode.CreateFailed, "Đã tồn tại toàn nhà này");
                }
                var area = await areaDbService.GetByIdAsync(areaId) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Area not found");
                var building = new Building
                {
                    Name   = name,
                    AreaId = areaId,
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
                return await context.Buildings.Include(a => a.Rooms).ToListAsync();
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

        public async Task<IEnumerable<Building>> GetByAreaIdAsync(Guid id)
        {
            try
            {
                return await context.Buildings.Where(b => b.AreaId == id).ToListAsync();
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
                return await context.Buildings.Include(a => a.Rooms).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
