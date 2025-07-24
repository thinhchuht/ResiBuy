namespace ResiBuy.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(ResiBuyContext context, IConfiguration configuration, ICodeGeneratorSerivce codeGeneratorSerivce) : ControllerBase
    {
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            var user = await context.Users
                .Include(u => u.Avatar)
                .Include(u => u.Reports)
                .Include(u => u.UserRooms)
                    .ThenInclude(ur => ur.Room)
                        .ThenInclude(r => r.Building)
                            .ThenInclude(b => b.Area)
                .FirstOrDefaultAsync(u => u.PhoneNumber == model.PhoneNumber);
            if (user == null)
            {
                return BadRequest(new { message = "Không tồn tại số điện thoại." });
            }

            if (!CustomPasswordHasher.VerifyPassword(model.Password, user.PasswordHash))
            {
                return BadRequest(new { message = "Sai mật khẩu." });
            }

            if (user.IsLocked) return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ ban quản lí."
            });

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
                    email = user.Email != null ? user.Email : null ,
                    fullName = user.FullName,
                    roles = roles,
                    phoneNumber = user.PhoneNumber,
                    avatar = user.Avatar,
                    rooms = user.UserRooms.Select(ur => new
                    {
                        roomId = ur.RoomId,
                        roomName = ur.Room.Name,
                        buildingName = ur.Room.Building.Name,
                        areaName = ur.Room.Building.Area.Name
                    }),
                    reportsCount = user.ReportCount
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
        public async Task<IActionResult> Logout([FromBody] string refreshToken)
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

        [HttpPost("forget-pass")]
        public async Task<IActionResult> ForgetPassword([FromBody] string phoneNumber)
        {
            var user = await context.Users.FirstOrDefaultAsync(x => x.PhoneNumber == phoneNumber);
            if (user == null)
            {
                return NotFound(new { message = "Không tồn tại số điện thoại không đúng" });
            }
            var code  = codeGeneratorSerivce.GenerateCodeAndCache(user.PhoneNumber);
            //await context.SaveChangesAsync();

            return Ok(ResponseModel.SuccessResponse(code));
        }

        [HttpPost("confirm-code")]
        public async Task<IActionResult> ConfirmCode([FromBody] string code)
        {
            var rs = codeGeneratorSerivce.TryGetCachedData<string>(code, out var phoneNumer);
            if(!rs) return NotFound(new { message = "Mã xác nhận không chính xác" });
            var user = await context.Users.FirstOrDefaultAsync(x => x.PhoneNumber == phoneNumer);
            user.PasswordHash = CustomPasswordHasher.HashPassword(Constants.DefaulAccountPassword);
            await context.SaveChangesAsync();
            return Ok(ResponseModel.SuccessResponse());
        }

        private string GenerateJwtToken(User user, IEnumerable<string> roles)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
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