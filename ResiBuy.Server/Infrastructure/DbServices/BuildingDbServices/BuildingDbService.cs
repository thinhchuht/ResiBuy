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

        public async Task<BuildingDto> CreateAsync(string name, Guid areaId)
        {
            try
            {
                if (string.IsNullOrEmpty(name)) return ResponseModel.FailureResponse("Name is Required");
                var getBuildingResponse = await GetByAreaIdOrNameAsync(areaId, name);
                if (getBuildingResponse.IsSuccess())
                    return ResponseModel.FailureResponse("Building already exists in this area");
                var building = new Building(name, areaId);
                await context.AddAsync(building);
                await context.SaveChangesAsync();
                return ResponseModel.SuccessResponse(building);
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }

        public async Task<IEnumerable<BuildingDto>> GetAllAsync()
        {
            try
            {
                return ResponseModel.SuccessResponse(await context.Buildings.Include(a => a.Rooms).ToListAsync());
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }

        public async Task<ResponseModel> GetByAreaIdOrNameAsync(Guid areaId, string name)
        {
            try
            {
                var query = context.Buildings.AsQueryable();

                if (!areaId.Equals(Guid.Empty))
                    query = query.Where(u => u.AreaId == areaId);

                if (!string.IsNullOrEmpty(name))
                    query = query.Where(u => u.Name == name);

                var buildings = await query.ToListAsync();
                if (!buildings.Any())
                    return ResponseModel.FailureResponse("Building not found");
                return ResponseModel.SuccessResponse(buildings);
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }

        public async Task<ResponseModel> GetByIdAsync(Guid id)
        {
            try
            {
                return ResponseModel.SuccessResponse(await context.Buildings.Include(a => a.Rooms).FirstOrDefaultAsync());
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }
    }
}
