using ResiBuy.Server.Application.Commands.OrderCommands;
using ResiBuy.Server.Application.Queries.OrderQueries;
using ResiBuy.Server.Infrastructure.Model.DTOs.CheckoutDtos;
using ResiBuy.Server.Infrastructure.Model.DTOs.OrderDtos;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll(OrderStatus orderStatus, PaymentMethod paymentMethod, PaymentStatus paymentStatus,Guid storeId, Guid shipperId, string userId = null, int pageNumber = 1, int pageSize = 10, DateTime? startDate = null, DateTime? endDate = null)
        {
            var result = await mediator.Send(new GetAllOrdersQuery(orderStatus, paymentMethod, paymentStatus, storeId, shipperId, userId, pageNumber, pageSize, startDate, endDate));
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await mediator.Send(new GetByIdOrdersQuery(id));
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CheckoutDto checkoutDto)
        {

            var result = await mediator.Send(new CreateOrderCommand(checkoutDto));
            return Ok(result);

        }

        [HttpPut]
        public async Task<IActionResult> UpdateOrder([FromBody] UpdateOrderDto dto)
        {
            var result = await mediator.Send(new UpdateOrderCommand(dto));
            return Ok(result);
        }

        [HttpPut("order-status")]
        public async Task<IActionResult> UpdateOrderStatus([FromBody] UpdateOrderStatusDto dto)
        {
            var result = await mediator.Send(new UpdateOrderStatusCommand(dto));
            return Ok(result);
        }
    }
}
