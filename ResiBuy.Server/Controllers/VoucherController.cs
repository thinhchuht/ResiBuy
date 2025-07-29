using ResiBuy.Server.Application.Commands.VoucherCommands;
using ResiBuy.Server.Application.Queries.VoucherQueries;
using ResiBuy.Server.Infrastructure.Model.DTOs.VoucherDtos;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VoucherController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllAsync([FromQuery] GetAllVouchersDto dto)
        {
            var result = await mediator.Send(new GetAllVouchersQuery(dto));
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(Guid id)
        {
            var result = await mediator.Send(new GetVoucherByIdQuery(id));
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsync([FromBody] CreateVoucherDto dto)
        {
            var result = await mediator.Send(new CreateVoucherCommand(dto));
            return Ok(result);
        }

        [HttpPut()]
        public async Task<IActionResult> UpdateQuantityAsync([FromBody] UpdateVoucherDto dto)
        {
            var result = await mediator.Send(new UpdateVoucherCommand(dto));
            return Ok(result);
        }

        [HttpPut("deactive")]
        public async Task<IActionResult> DeactiveAsync([FromBody] DeactivateVoucherDto dto)
        {
            var result = await mediator.Send(new DeactivateVoucherCommand(dto));
            return Ok(result);
        }


        [HttpGet("batch/deactive")]
        public async Task<IActionResult> DeactiveBatchAsync()
        {
            var result = await mediator.Send(new DeactivateBatchVoucherCommand());
            return Ok(result);
        }
    }
}
