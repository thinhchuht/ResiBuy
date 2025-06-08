using ResiBuy.Server.Exceptions;

namespace ResiBuy.Server.Infrastructure.DbServices.AreaDbServices
{
    public class AreaDbService : BaseDbService<Area>, IAreaDbService
    {
        private readonly ResiBuyContext _context;

        public AreaDbService(ResiBuyContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Area>> GetAllAreaAsync()
        {
            try
            {
                IEnumerable<Area> areas = await _context.Areas
                    .Include(a => a.Buildings)
                    .Include(a => a.Shippers)
                    .ToListAsync();
                return areas;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError,ex.Message);
            }
        }

        public async Task<Area> GetByIdAsync(Guid id)
        {
            try
            {
                var area = await _context.Areas
                                    .Include(a => a.Buildings)
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
    }
}
