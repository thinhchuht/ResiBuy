using ResiBuy.Server.Application.Queriestore.StoreQueries;
using ResiBuy.Server.Infrastructure.Model;

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
        [HttpGet("count")]
        public async Task<IActionResult> CountAllStores()
        {
            var result = await _mediator.Send(new CountAllStoresQuery());
            return Ok(result);
        }

        [HttpGet("count/status")]
        public async Task<IActionResult> CountStoreStatus()
        {
            var result = await _mediator.Send(new CountStoreStatusQuery());
            return Ok(result);
        }

        [HttpGet("top-sale-products")]
        public async Task<IActionResult> GetTopSaleProducts(
            [FromQuery] Guid storeId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var query = new TopSaleProductQuery(storeId, startDate, endDate);
            ResponseModel response = await _mediator.Send(query);
            return Ok(response);
        }

        [HttpGet("sales-analysis")]
        public async Task<IActionResult> GetSalesAnalysis(
            [FromQuery] Guid storeId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var query = new SalesAnalysisQuery(storeId, startDate, endDate);
            ResponseModel response = await _mediator.Send(query);
            return Ok(response);
        }

        [HttpGet("top-sale-detail")]
        public async Task<IActionResult> GetTopSaleDetail([FromQuery] int productId)
        {
            var query = new TopSaleDetailQuery(productId);
            ResponseModel response = await _mediator.Send(query);
            return Ok(response);
        }
        [HttpGet("get-chart-data")]
        public async Task<IActionResult> GetChartData(
            [FromQuery] Guid storeId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var query = new GetChartDataQuery(storeId, startDate, endDate);
            ResponseModel response = await _mediator.Send(query);
            return Ok(response);
        }
    }
}