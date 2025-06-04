namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(UserManager<User> userManager) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO model)
        {
            var user = new User
            {
                UserName       = model.Email,
                Email          = model.Email,
                FullName       = model.FullName,
                DateOfBirth    = model.DateOfBirth,
                IdentityNumber = model.IdentityNumber,
                CreatedAt      = DateTime.Now,
                UpdatedAt      = DateTime.Now,
                Roles          = model.Roles ?? [Constants.CustomerRole],
            };

            var result = await userManager.CreateAsync(user, model.Password);
            if (result.Succeeded)
            {
                return Ok(new { message = "User created successfully" });
            }

            return BadRequest(result.Errors);
        }
    }
}
