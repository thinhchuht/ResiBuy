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

        [HttpPost]
        public async Task<IActionResult> CreateAsync([FromBody] CreateVoucherDto dto)
        {
            var result = await mediator.Send(new CreateVoucherCommand(dto));
            return Ok(result);
        }

        [HttpPut("quantity")]
        public async Task<IActionResult> UpdateQuantityAsync([FromBody] UpdateQuantityVoucherDto dto)
        {
            var result = await mediator.Send(new UpdateQuantityCommand(dto));
            return Ok(result);
        }

        [HttpPut("active")]
        public async Task<IActionResult> ActiveAsync([FromBody] ActiveVoucherDto dto)
        {
            var result = await mediator.Send(new UpdateQuantityCommand(dto));
            return Ok(result);
        }
    }
}
