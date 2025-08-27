namespace ResiBuy.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]

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

        [HttpPut]
        public async Task<IActionResult> UpdateShipper([FromBody] UpdateShipperCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("location")]
        public async Task<IActionResult> UpdateShipperLocation( [FromBody] UpdateShipperLocationCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("status")]
        public async Task<IActionResult> UpdateShipperStatus( [FromBody] UpdateShipperStatusCommand command)
        {
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

        [HttpGet("getDistance")]
        public async Task<IActionResult> GetDistanceAsync([FromQuery] GetDistanceQuery query)
        {
            try
            {
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        [HttpGet("stats")]
        public async Task<IActionResult> GetStatsShipper()
        {
            var result = await _mediator.Send(new GetStatsShipperQuery());
            return Ok(result);
        }
        [HttpGet("search")]
        public async Task<IActionResult> SearchShipper([FromQuery]string? keyWord,[FromQuery] bool? isOnline,
        [FromQuery] bool? isLocked,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 5)
        {
            var result = await _mediator.Send(new SearchShippersQuery(keyWord,isOnline, isLocked, pageNumber, pageSize));
            return Ok(result);
        }

        [HttpGet("timesheets")]
        public async Task<IActionResult> GetTimeSheets([FromQuery]Guid shipperId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var result = await _mediator.Send(new GetTimeSheetsQuery(shipperId, startDate, endDate));
            return Ok(result);
        }

        }
}