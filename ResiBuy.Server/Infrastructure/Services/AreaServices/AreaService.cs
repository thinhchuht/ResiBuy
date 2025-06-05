namespace ResiBuy.Server.Infrastructure.Services.AreaServices
{
    public class AreaService(ResiBuyContext context) : IAreaService
    {
        public async Task<ResponseModel> GetAllAreaAsync()
        {
            try
            {
                return ResponseModel.SuccessResponse(await context.Areas.Include(a => a.Buildings).ThenInclude(b => b.Rooms).Include(a => a.Shippers).ToListAsync());
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }
    }
}
