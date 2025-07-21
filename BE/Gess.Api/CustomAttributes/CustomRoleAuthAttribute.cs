using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace Gess.Api.CustomAttributes
{
    public class CustomRoleAuthAttribute : Attribute, IAuthorizationFilter
    {
        private readonly string[] _requiredRoles;

        public CustomRoleAuthAttribute(params string[] requiredRoles)
        {
            _requiredRoles = requiredRoles ?? throw new ArgumentNullException(nameof(requiredRoles));
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            // Kiểm tra authentication trước
            if (!context.HttpContext.User.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // Lấy tất cả role claims
            var userRoles = context.HttpContext.User
                .FindAll(ClaimTypes.Role)
                .Select(c => c.Value)
                .ToList();

            // Log để debug
            var logger = context.HttpContext.RequestServices.GetService<ILogger<CustomRoleAuthAttribute>>();
            logger?.LogInformation($"[CUSTOM AUTH] User roles: [{string.Join(", ", userRoles)}]");
            logger?.LogInformation($"[CUSTOM AUTH] Required roles: [{string.Join(", ", _requiredRoles)}]");

            // Kiểm tra xem user có ít nhất một trong các role yêu cầu không
            var hasRequiredRole = _requiredRoles.Any(requiredRole => 
                userRoles.Any(userRole => string.Equals(userRole, requiredRole, StringComparison.Ordinal)));

            logger?.LogInformation($"[CUSTOM AUTH] Has required role: {hasRequiredRole}");

            if (!hasRequiredRole)
            {
                context.Result = new ForbidResult();
                return;
            }

            // Authorization thành công - không cần làm gì thêm
        }
    }
} 