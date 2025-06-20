using ResiBuy.Server.Application.Commands.OrderCommands;
using ResiBuy.Server.Application.Queries.OrderQueries;
using ResiBuy.Server.Infrastructure.Model.DTOs.OrderDtos;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll(OrderStatus orderStatus, PaymentMethod paymentMethod, PaymentStatus paymentStatus, string userId = null, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var result = await mediator.Send(new GetAllOrdersQuery( orderStatus, paymentMethod, paymentStatus, userId, pageNumber, pageSize));
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CheckoutDto checkoutDto)
        {
            try
            {
                var result = await mediator.Send(new CreateOrderCommand(checkoutDto));
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateOrder([FromBody] UpdateOrderDto dto)
        {
            try
            {
                var result = await mediator.Send(new UpdateOrderCommand(dto));
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
