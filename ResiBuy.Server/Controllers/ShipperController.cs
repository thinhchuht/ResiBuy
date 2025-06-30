using MediatR;
using Microsoft.AspNetCore.Mvc;
using ResiBuy.Server.Application.Commands.ShipperCommands;
using ResiBuy.Server.Application.Queries.ShipperQueries;

namespace ResiBuy.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShipperController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ShipperController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> CreateShipper([FromBody] CreateShipperCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateShipper(Guid id, [FromBody] UpdateShipperCommand command)
        {
            command = command with { Id = id };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("{id}/location")]
        public async Task<IActionResult> UpdateShipperLocation(Guid id, [FromBody] UpdateShipperLocationCommand command)
        {
            command = command with { ShipperId = id };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateShipperStatus(Guid id, [FromBody] UpdateShipperStatusCommand command)
        {
            command = command with { ShipperId = id };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllShippers([FromQuery] int pageSize = 5, [FromQuery] int pageNumber = 1)
        {
            var result = await _mediator.Send(new GetAllShippersQuery(pageNumber, pageSize));
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetShipperById(Guid id)
        {
            var result = await _mediator.Send(new GetShipperByIdQuery(id));
            return Ok(result);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetShipperByUserId(string userId)
        {
            var result = await _mediator.Send(new GetShipperByUserIdQuery(userId));
            return Ok(result);
        }
    }
}