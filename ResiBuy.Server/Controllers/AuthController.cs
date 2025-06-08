namespace ResiBuy.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(ResiBuyContext context, IConfiguration configuration) : ControllerBase
    {
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == model.PhoneNumber);
            if (user == null)
            {
                return BadRequest(new { message = "Invalid phone number or password" });
            }

            if (!CustomPasswordHasher.VerifyPassword(model.Password, user.PasswordHash))
            {
                return BadRequest(new { message = "Wrong password" });
            }

            var roles = user.Roles ?? [];
            var token = GenerateJwtToken(user, roles);
            var refreshToken = GenerateRefreshToken();

            var refreshTokenEntity = new RefreshToken
            {
                Token = refreshToken,
                UserId = user.Id,
                ExpiryDate = DateTime.Now.AddDays(7),
                CreatedAt = DateTime.Now,
            };

            context.RefreshTokens.Add(refreshTokenEntity);
            await context.SaveChangesAsync();

            return Ok(new
            {
                token,
                refreshToken,
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    fullName = user.FullName,
                    roles = roles,
                    phoneNumber = user.PhoneNumber
                }
            });
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken(string refreshToken)
        {
            var existRefreshToken = await context.RefreshTokens
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.Token == refreshToken);

            if (existRefreshToken == null)
                return Unauthorized(new { message = "Invalid refresh token" });

            if (existRefreshToken.ExpiryDate < DateTime.Now)
                return Unauthorized(new { message = "Refresh token expired" });

            if (existRefreshToken.IsRevoked)
                return Unauthorized(new { message = "Refresh token revoked" });

            var user = existRefreshToken.User;
            var roles = user.Roles ?? [];
            var newToken = GenerateJwtToken(user, roles);
            var newRefreshToken = GenerateRefreshToken();

            // Revoke old refresh token
            existRefreshToken.IsRevoked = true;
            existRefreshToken.RevokedAt = DateTime.Now;
            existRefreshToken.ReplacedByToken = newRefreshToken;

            // Save new refresh token
            var newRefreshTokenEntity = new RefreshToken
            {
                Token = newRefreshToken,
                UserId = user.Id,
                ExpiryDate = DateTime.Now.AddDays(7),
                CreatedAt = DateTime.Now,
            };

            context.RefreshTokens.Add(newRefreshTokenEntity);
            await context.SaveChangesAsync();

            return Ok(new
            {
                token = newToken,
                refreshToken = newRefreshToken
            });
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout([FromQuery] string refreshToken)
        {
            if (string.IsNullOrEmpty(refreshToken))
            {
                return BadRequest(new { message = "Refresh token is required" });
            }

            var existRefreshToken = await context.RefreshTokens
                .FirstOrDefaultAsync(x => x.Token == refreshToken);

            if (existRefreshToken == null)
            {
                return NotFound(new { message = "Refresh token not found" });
            }

            existRefreshToken.IsRevoked = true;
            existRefreshToken.RevokedAt = DateTime.Now;
            existRefreshToken.ReasonRevoked = "Revoked during logout";

            await context.SaveChangesAsync();

            return Ok(new { message = "Logged out successfully" });
        }

        private string GenerateJwtToken(User user, IEnumerable<string> roles)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.MobilePhone, user.PhoneNumber)
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddSeconds(Convert.ToDouble(configuration["Jwt:ExpireMinutes"]));

            var token = new JwtSecurityToken(
                configuration["Jwt:Issuer"],
                configuration["Jwt:Audience"],
                claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}