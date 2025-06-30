using MediatR;
using Microsoft.AspNetCore.Mvc;
using ResiBuy.Server.Application.Commands.StoreCommands;
using ResiBuy.Server.Application.Queries.StoreQueries;

namespace ResiBuy.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StoreController : ControllerBase
    {
        private readonly IMediator _mediator;

        public StoreController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> CreateStore([FromBody] CreateStoreCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStore(Guid id, [FromBody] UpdateStoreCommand command)
        {
            command = command with { Id = id };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStoreStatus(Guid id, [FromBody] UpdateStoreStatusCommand command)
        {
            command = command with { StoreId = id };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllStores([FromQuery] int pageSize = 5, [FromQuery] int pageNumber = 1)
        {
            var result = await _mediator.Send(new GetAllStoresQuery(pageNumber, pageSize));
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetStoreById(Guid id)
        {
            var result = await _mediator.Send(new GetStoreByIdQuery(id));
            return Ok(result);
        }

        [HttpGet("owner/{ownerId}")]
        public async Task<IActionResult> GetStoreByOwnerId(string ownerId, [FromQuery] int pageSize = 5, [FromQuery] int pageNumber = 1)
        {
            var result = await _mediator.Send(new GetStoreByOwnerIdQuery(ownerId, pageSize, pageNumber));
            return Ok(result);
        }
    }
}