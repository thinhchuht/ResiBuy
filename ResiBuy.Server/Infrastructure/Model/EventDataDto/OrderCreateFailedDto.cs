namespace ResiBuy.Server.Infrastructure.Model.EventDataDto
{
    public class OrderCreateFailedDto
    {
        public OrderCreateFailedDto(IEnumerable<Guid> orderIds, string errorMessage)
        {
            OrderIds = orderIds;
            ErrorMessage = errorMessage;
        }

        public IEnumerable<Guid> OrderIds { get; set; }
        public string ErrorMessage { get; set; }
    }
}
