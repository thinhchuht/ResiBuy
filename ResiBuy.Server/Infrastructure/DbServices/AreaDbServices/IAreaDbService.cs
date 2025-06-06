namespace ResiBuy.Server.Infrastructure.DbServices.AreaDbServices
{
    public interface IAreaDbService
    {
        Task<ResponseModel> GetAllAreaAsync();
    }
}