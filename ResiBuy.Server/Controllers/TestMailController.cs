
using ResiBuy.Server.Services.MailServices;

namespace ResiBuy.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestMailController(IMailService mailService) : Controller
    {
        [HttpGet]
        public async Task<IActionResult> TestMail()
        {
            await mailService.SendEmailAsync("thinhchuht0@gmail.com", "Test Mail", "This is a test mail");
            return Ok("Mail sent successfully");
        }
    }
}