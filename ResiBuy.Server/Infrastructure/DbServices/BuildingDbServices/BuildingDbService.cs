using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.Model.DTOs;

namespace ResiBuy.Server.Infrastructure.DbServices.BuildingDbServices
{
    public class BuildingDbService : BaseDbService<Building>, IBuildingDbService
    {
        private readonly ResiBuyContext context;

        public BuildingDbService(ResiBuyContext context) : base(context)
        {
            this.context = context;
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
