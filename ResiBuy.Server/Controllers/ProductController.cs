using ResiBuy.Server.Application.Commands.OrderCommands;
using ResiBuy.Server.Application.Commands.OrderCommands.Dtos;
using ResiBuy.Server.Application.Commands.ProductCommands;
using ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Create;
using ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Update;
using ResiBuy.Server.Application.Queries.ProductQueries;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class ProductController(IMediator mediator) : ControllerBase
    {
        //[Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateAsync([FromBody] CreateProductDto dto)
        {
            var result = await mediator.Send(new CreateProductCommand(dto));
            return Ok(result);
        }
        //[Authorize]
        [HttpPut]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateProductDto dto)
        {
            var result = await mediator.Send(new UpdateProductCommand(dto));
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            var result = await mediator.Send(new GetProductByIdQuery(id));
            return Ok(result);
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetAllProducts([FromQuery] ProductFilter filter)
        {
            var result = await mediator.Send(new GetAllProductsQuery(filter));
            return Ok(result);
        }
        //[Authorize]

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatusProduct(int id, [FromBody] bool status)
        {
            var result = await mediator.Send(new UpdateStatusProductCommand(id, status));
            return Ok(result);
        }
        [HttpPost("import-excel")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> ImportProductByExcel([FromForm] ImportProductExcelRequest request)
        {
            if (request.File == null || request.File.Length == 0)
                return BadRequest("File không hợp lệ");

            var allowedExtensions = new[] { ".xlsx", ".xls" };
            var fileExtension = Path.GetExtension(request.File.FileName)?.ToLowerInvariant();

            if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension))
            {
                return BadRequest(new ImportResult
                {
                    Success = false,
                    Total = 0,
                    Errors = new List<string> { "Chỉ chấp nhận file Excel (.xlsx, .xls)" }
                });
            }

            using var stream = request.File.OpenReadStream();

            var result = await mediator.Send(new ImportProductExcelCommand(stream));

            return Ok(result);
        }

        [HttpPost("remove-barcode")]
        public async Task<IActionResult> RemoveBarcodeFromProduct([FromBody] List<string> dto)
        {
            var result = await mediator.Send(new RemoveBarcodeFromProductCommand(dto));
            return Ok(result);
        }
    }
}