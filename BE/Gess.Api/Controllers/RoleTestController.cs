using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GESS.Common;
using Gess.Api.CustomAttributes;

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
        [Authorize(Roles = PredefinedRole.ADMIN_ROLE)]
        public IActionResult AdminOnly()
        {
            var userId = User.FindFirst("Userid")?.Value;
            var username = User.FindFirst("Username")?.Value;
            var roles = User.FindAll("Role").Select(c => c.Value);

            return Ok(new
            {
                Message = "Bạn có quyền Admin",
                UserId = userId,
                Username = username,
                Roles = roles
            });
        }

        [HttpGet("teacher")]
        [Authorize(Roles = PredefinedRole.TEACHER_ROLE)]
        public IActionResult TeacherOnly()
        {
            var userId = User.FindFirst("Userid")?.Value;
            var username = User.FindFirst("Username")?.Value;
            var roles = User.FindAll("Role").Select(c => c.Value);

            return Ok(new
            {
                Message = "Bạn có quyền Teacher",
                UserId = userId,
                Username = username,
                Roles = roles
            });
        }

        [HttpGet("student")]
        [CustomRoleAuth(PredefinedRole.STUDENT_ROLE)]
        public IActionResult StudentOnly()
        {
            // Sử dụng custom claim names từ JWT
            var userId = User.FindFirst("Userid")?.Value;
            var username = User.FindFirst("Username")?.Value;
            var roles = User.FindAll("Role").Select(c => c.Value);

            return Ok(new
            {
                Message = "Bạn có quyền Student",
                UserId = userId,
                Username = username,
                Roles = roles
            });
        }

        [HttpGet("admin-or-teacher")]
        [Authorize(Roles = PredefinedRole.ADMIN_ROLE + "," + PredefinedRole.TEACHER_ROLE)]
        public IActionResult AdminOrTeacher()
        {
            var userId = User.FindFirst("Userid")?.Value;
            var username = User.FindFirst("Username")?.Value;
            var roles = User.FindAll("Role").Select(c => c.Value);

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

        [HttpGet("debug-claims")]
        [Authorize] // Chỉ cần authentication, không cần role cụ thể
        public IActionResult DebugClaims()
        {
            var allClaims = User.Claims.Select(c => new 
            {
                Type = c.Type,
                Value = c.Value,
                ValueBytes = System.Text.Encoding.UTF8.GetBytes(c.Value ?? ""),
                ValueLength = (c.Value ?? "").Length
            }).ToList();

            var isAuthenticated = User.Identity.IsAuthenticated;
            var authType = User.Identity.AuthenticationType;
            var name = User.Identity.Name;

            // Chi tiết về role claims
            var standardRoles = User.FindAll(System.Security.Claims.ClaimTypes.Role).ToList();
            var roleDetails = standardRoles.Select(r => new
            {
                Value = r.Value,
                ValueBytes = System.Text.Encoding.UTF8.GetBytes(r.Value ?? ""),
                ValueLength = (r.Value ?? "").Length,
                EqualsStudentRole = r.Value == PredefinedRole.STUDENT_ROLE,
                EqualsStudentRoleIgnoreCase = string.Equals(r.Value, PredefinedRole.STUDENT_ROLE, StringComparison.OrdinalIgnoreCase),
                ContainsStudentRole = (r.Value ?? "").Contains(PredefinedRole.STUDENT_ROLE)
            }).ToList();

            // Test multiple ways to check role
            var studentRoleConstant = PredefinedRole.STUDENT_ROLE;
            var isInRoleResult = User.IsInRole(studentRoleConstant);
            
            _logger.LogInformation("=== ROLE DEBUG START ===");
            _logger.LogInformation($"Student Role Constant: '{studentRoleConstant}'");
            _logger.LogInformation($"Student Role Bytes: [{string.Join(", ", System.Text.Encoding.UTF8.GetBytes(studentRoleConstant))}]");
            _logger.LogInformation($"User.IsInRole() result: {isInRoleResult}");
            
            foreach (var role in standardRoles)
            {
                _logger.LogInformation($"Found role: '{role.Value}', Bytes: [{string.Join(", ", System.Text.Encoding.UTF8.GetBytes(role.Value ?? ""))}]");
                _logger.LogInformation($"  Equals check: {role.Value == studentRoleConstant}");
                _logger.LogInformation($"  IsInRole for this specific role: {User.IsInRole(role.Value)}");
            }
            _logger.LogInformation("=== ROLE DEBUG END ===");

            return Ok(new
            {
                IsAuthenticated = isAuthenticated,
                AuthenticationType = authType,
                IdentityName = name,
                AllClaims = allClaims,
                CustomRoleClaims = User.FindAll("Role").Select(c => c.Value).ToList(),
                StandardRoleClaims = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList(),
                RoleDetails = roleDetails,
                HasStudentRole = isInRoleResult,
                StudentRoleConstant = studentRoleConstant,
                StudentRoleBytes = System.Text.Encoding.UTF8.GetBytes(studentRoleConstant),
                CustomRoleCheck = User.FindAll("Role").Any(c => c.Value == PredefinedRole.STUDENT_ROLE),
                StandardRoleCheck = User.FindAll(System.Security.Claims.ClaimTypes.Role).Any(c => c.Value == PredefinedRole.STUDENT_ROLE),
                // Test các cách check khác nhau
                IsInRoleWithDifferentStrings = new
                {
                    ExactString = User.IsInRole("Học sinh"),
                    FromConstant = User.IsInRole(PredefinedRole.STUDENT_ROLE),
                    ManualCheck = User.Claims.Any(c => c.Type == System.Security.Claims.ClaimTypes.Role && c.Value == PredefinedRole.STUDENT_ROLE)
                }
            });
        }

        [HttpGet("test-student-simple")]
        [Authorize] // Chỉ cần authentication
        public IActionResult TestStudentSimple()
        {
            // Kiểm tra thủ công thay vì dùng [Authorize(Roles = ...)]
            var roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();
            var hasStudentRole = roles.Contains(PredefinedRole.STUDENT_ROLE);
            
            if (!hasStudentRole)
            {
                return Forbid($"Không có quyền student. Roles hiện tại: {string.Join(", ", roles)}");
            }

            return Ok(new
            {
                Message = "✅ Truy cập thành công với quyền Student!",
                DetectedRoles = roles,
                StudentRoleConstant = PredefinedRole.STUDENT_ROLE
            });
        }

        [HttpGet("test-student-custom-attr")]
        [CustomRoleAuth(PredefinedRole.STUDENT_ROLE)]
        public IActionResult TestStudentCustomAttribute()
        {
            var roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();

            return Ok(new
            {
                Message = "✅ Custom authorization hoạt động!",
                DetectedRoles = roles,
                AuthMethod = "CustomRoleAuthAttribute"
            });
        }

        [HttpGet("debug-jwt-config")]
        [AllowAnonymous]
        public IActionResult DebugJwtConfig()
        {
            try
            {
                return Ok(new
                {
                    Message = "JWT Configuration Debug",
                    Config = new
                    {
                        Issuer = Constants.Issuer,
                        Audience = Constants.Audience,
                        ExpiresMs = Constants.Expires,
                        ExpiresSeconds = Constants.Expires / 1000.0,
                        SecretKeyLength = Constants.SecretKey?.Length ?? 0,
                        SecretKeyPrefix = Constants.SecretKey?.Substring(0, Math.Min(10, Constants.SecretKey?.Length ?? 0)) + "...",
                        CurrentUtc = DateTime.UtcNow,
                        SampleTokenExpiry = DateTime.UtcNow.AddMilliseconds(Constants.Expires)
                    },
                    Note = $"Token sẽ hết hạn sau {Constants.Expires}ms ({Constants.Expires / 1000.0} giây)"
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    Error = ex.Message,
                    Message = "Lỗi khi đọc JWT config"
                });
            }
        }
    }
} 