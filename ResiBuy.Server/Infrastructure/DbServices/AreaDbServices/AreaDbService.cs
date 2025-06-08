namespace ResiBuy.Server.Infrastructure.DbServices.AreaDbServices
{
    public class AreaDbService(ResiBuyContext context) : IAreaDbService
    {
        public async Task<IEnumerable<AreaDto>> GetAllAreaAsync()
        {
            try
            {
                IEnumerable<Area> areas = await context.Areas.Include(a => a.Buildings).ThenInclude(b => b.Rooms).Include(a => a.Shippers).ToListAsync();
                IEnumerable<AreaDto> areaDtos = areas.Select(a => new AreaDto(a));
                refturn areaDtos;

            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }
    }
}
