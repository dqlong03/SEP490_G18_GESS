using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GESS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Yêu cầu xác thực cho tất cả các endpoints
    public class RoleTestController : ControllerBase
    {
        private readonly ILogger<RoleTestController> _logger;

        public RoleTestController(ILogger<RoleTestController> logger)
        {
            _logger = logger;
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public IActionResult AdminOnly()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value);

            return Ok(new
            {
                Message = "Bạn có quyền Admin",
                UserId = userId,
                Username = username,
                Roles = roles
            });
        }

        [HttpGet("teacher")]
        [Authorize(Roles = "Teacher")]
        public IActionResult TeacherOnly()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value);

            return Ok(new
            {
                Message = "Bạn có quyền Teacher",
                UserId = userId,
                Username = username,
                Roles = roles
            });
        }

        [HttpGet("student")]
        [Authorize(Roles = "Student")]
        public IActionResult StudentOnly()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value);

            return Ok(new
            {
                Message = "Bạn có quyền Student",
                UserId = userId,
                Username = username,
                Roles = roles
            });
        }

        [HttpGet("admin-or-teacher")]
        [Authorize(Roles = "Admin,Teacher")]
        public IActionResult AdminOrTeacher()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value);

            return Ok(new
            {
                Message = "Bạn có quyền Admin hoặc Teacher",
                UserId = userId,
                Username = username,
                Roles = roles
            });
        }

        [HttpGet("public")]
        [AllowAnonymous]
        public IActionResult Public()
        {
            return Ok(new { Message = "Endpoint này không yêu cầu xác thực" });
        }
    }
} 