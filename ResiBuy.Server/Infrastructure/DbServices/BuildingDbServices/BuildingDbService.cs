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
                var building = await GetBuildingByNameAndAreaIdAssync(name, areaId);
                if (building != null)
                {
                    throw new CustomException(ExceptionErrorCode.NotFound);
                }
                var area = await areaDbService.GetByIdAsync(areaId);
                if (area == null)
                {
                    throw new CustomException(ExceptionErrorCode.NotFound, "Area not found");
                }
                context.Buildings.Add(building);
                await context.SaveChangesAsync();
                return building;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError,ex.Message);
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
        public async Task<Building> GetByIdAsync(Guid id)
        {
            try
            {
                return await context.Buildings.Include(a => a.Rooms).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError,ex.Message);
            }
        }
    }
}
