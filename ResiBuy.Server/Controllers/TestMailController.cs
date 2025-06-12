using Resend;
using System.ComponentModel.DataAnnotations;

namespace ResiBuy.Server.Controllers
{
    public class TestMailController : Controller
    {
        private readonly IResend _resend;
        private readonly ILogger<TestMailController> _logger;


        /// <summary />
        public TestMailController(IResend resend, ILogger<TestMailController> logger)
        {
            _resend = resend;
            _logger = logger;
        }


        /// <summary>
        /// Sends a pre-defined email.
        /// </summary>
        [HttpGet]
        [Route("email/send")]
        public async Task<string> EmailSendFixed()
        {
            /*
             * 
             */

            var resp = await _resend.EmailSendAsync(new EmailMessage()
            {
                From = "Acme <resibuydev@gmail.com>",
                To = "thinhld2249@gmail.com",
                Subject = "hello world",
                HtmlBody = "<p>it works!</p>",
            });

            _logger.LogInformation("Sent email, with Id = {EmailId}", resp.Content);

            return resp.Content.ToString();
        }


        /// <summary>
        /// Sends an email to specified email address.
        /// </summary>
        [HttpPost]
        [Route("email/send")]
        public async Task<ActionResult<string>> EmailSend([FromBody] EmailSendRequest request)
        {
            /*
             * Validate
             */
            if (ModelState.IsValid == false)
            {
                return BadRequest();
            }


            /*
             * 
             */
            var message = new EmailMessage();
            message.From = "you@domain.com";
            message.To.Add(request.To);
            message.Subject = request.Subject ?? "Hello from Web Controller";
            message.TextBody = "Email using Resend .NET SDK";

            var resp = await _resend.EmailSendAsync(message);

            _logger.LogInformation("Sent email to {To}, with Id = {EmailId}", request.To, resp.Content);

            return resp.Content.ToString();
        }


        /// <summary>
        /// Request payload.
        /// </summary>
        public class EmailSendRequest
        {
            /// <summary>
            /// Email address of recipient.
            /// </summary>
            [Required]
            [EmailAddress]
            public string To { get; set; } = default!;

            /// <summary>
            /// Subject.
            /// </summary>
            [StringLength(100, MinimumLength = 1)]
            public string? Subject { get; set; }
        }
    }
}