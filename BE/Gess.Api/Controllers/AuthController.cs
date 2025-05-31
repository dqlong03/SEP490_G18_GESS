using Gess.Repository.Infrastructures;
using GESS.Auth;
using GESS.Entity.Entities;
using GESS.Model;
using GESS.Service.authservice;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IJwtService _jwtService;
        private readonly UserManager<User> _userManager;
        private readonly IUnitOfWork _unitOfWork;

        public AuthController(
            IAuthService authService,
            IJwtService jwtService,
            UserManager<User> userManager,
            IUnitOfWork unitOfWork)
        {
            _authService = authService;
            _jwtService = jwtService;
            _userManager = userManager;
            _unitOfWork = unitOfWork;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginModel loginModel)
        {
            var result = await _authService.LoginAsync(loginModel);

            if (!result.Success)
            {
                return BadRequest(new { message = result.ErrorMessage });
            }

            return Ok(new
            {
                token = result.AccessToken
            });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] string refreshToken)
        {
            var result = await _authService.RefreshTokenAsync(refreshToken);
            if (!result.Success)
                return Unauthorized(result);

            return Ok(result);
        }
        [HttpGet("test")]
        [Authorize]
        public IActionResult Test()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value);

            return Ok(new
            {
                Message = "Token hợp lệ",
                UserId = userId,
                Username = username,
                Roles = roles
            });
        }
    }
}
