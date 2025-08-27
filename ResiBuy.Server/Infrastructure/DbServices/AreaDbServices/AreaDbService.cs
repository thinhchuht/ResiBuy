using ResiBuy.Server.Services.MapBoxService;

namespace ResiBuy.Server.Infrastructure.DbServices.AreaDbServices
{
    public class AreaDbService : BaseDbService<Area>, IAreaDbService
    {
        private readonly ResiBuyContext _context;
        private readonly MapBoxService _mapBoxService;
        private readonly ILogger<AreaDbService> _logger;
        public AreaDbService(ResiBuyContext context, MapBoxService mapBoxService, ILogger<AreaDbService> logger) : base(context)
        {
            _context = context;
            _mapBoxService = mapBoxService;
            _logger = logger;
        }

        public async Task<IEnumerable<Area>> GetAllAreaAsync(bool getActive)
        {
            try
            {
                var query = _context.Areas.AsQueryable();
                if (getActive)
                {
                    query = query.Where(a => a.IsActive);
                }
                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<Area> GetByIdAsync(Guid id)
        {
            try
            {
                var area = await _context.Areas
                    .Include(a => a.Buildings)
                    .ThenInclude(b => b.Rooms)
                    .ThenInclude(r => r.Stores)
                    .Include(a => a.Shippers)
                    .FirstOrDefaultAsync(a => a.Id == id);
                if (area == null)
                {
                    return null;
                }
                return area;
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
                return await _context.Areas.CountAsync();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<Area> NearestAreaHasShipper(Guid currenId)
        {
            try
            {
                var areas = await _context.Areas.Include(s => s.Shippers).Where(a => a.Shippers.Any(s => s.IsOnline)).ToListAsync();
                var curentAreas = await GetByIdAsync(currenId);
                Area nearestArea = null;
                double distance = 0;
                foreach (var area in areas)
                {
                    var router = await _mapBoxService.GetDirectionsAsync(curentAreas.Longitude, curentAreas.Latitude, area.Longitude, area.Latitude);
                    if (router != null && router.Routes.Count() > 0)
                    {
                        if (distance == 0 || router.Routes[0].Distance < distance)
                        {
                            distance = router.Routes[0].Distance;
                            nearestArea = area;
                        }
                    }
                    else
                    {
                        _logger.LogInformation("Router exception");
                    }
                }
                return nearestArea;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        public async Task<bool> IsNameExistsAsync(string name)
        {
            return await _context.Areas.AnyAsync(a => a.Name == name);
        }
        public override async Task<IEnumerable<Area>> AddRangeAsync(IEnumerable<Area> entities)
        {
            try
            {
                foreach (var entity in entities)
                {
                    if (await IsNameExistsAsync(entity.Name))
                    {
                        throw new CustomException(ExceptionErrorCode.RepositoryError, $"Khu vực với tên {entity.Name} đã tồn tại");
                    }
                }
                return await base.AddRangeAsync(entities);
            }
            catch (CustomException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
