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
        public async Task<IActionResult> GetById(Guid id, [FromQuery] string userId)
        {
            var result = await mediator.Send(new GetByIdOrdersQuery(id, userId));
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

        [HttpGet("count")]
        public async Task<IActionResult> CountOrders( Guid? shipperId,  Guid? storeId,  string? userId,  OrderStatus? status)
        {
            var query = new CountOrdersQuery(shipperId, storeId, userId, status);
            var result = await mediator.Send(query);
            return Ok(result);
        }

       
        [HttpGet("total-shipping-fee")]
        public async Task<IActionResult> GetTotalShippingFee(Guid shipperId,  DateTime? startDate,  DateTime? endDate)
        {
            var query = new GetTotalShippingFeeQuery(shipperId, startDate, endDate);
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("total-amount")]
        public async Task<IActionResult> GetTotalOrderAmount([FromQuery] string userId, [FromQuery] Guid storeId)
        {
            var result = await mediator.Send(new GetTotalOrderAmountQuery(userId, storeId));
            return Ok(result);
        }

    }
}
