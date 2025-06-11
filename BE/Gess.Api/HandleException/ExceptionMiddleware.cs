using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using GESS.Common.HandleException;
namespace GESS.Api.HandleException
{
    // ThaiNH_Create_UserProfile
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly IWebHostEnvironment _env;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IWebHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            _logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);

            context.Response.ContentType = "application/json";
            var response = new ErrorResponse
            {
                Message = "An error occurred",
                Details = _env.IsDevelopment() ? exception.Message : null
            };

            switch (exception)
            {
                case BadRequestException ex:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest; // 400
                    response.Message = ex.Message;
                    break;

                case ValidationException ex:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest; // 400
                    response.Message = ex.Message;
                    response.Errors = ex.Errors;
                    break;

                case NotFoundException ex:
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound; // 404
                    response.Message = ex.Message;
                    break;

                case UnauthorizedException ex:
                    context.Response.StatusCode = (int)HttpStatusCode.Unauthorized; // 401
                    response.Message = ex.Message;
                    break;

                case ForbiddenException ex:
                    context.Response.StatusCode = (int)HttpStatusCode.Forbidden; // 403
                    response.Message = ex.Message;
                    break;

                case ConflictException ex:
                    context.Response.StatusCode = (int)HttpStatusCode.Conflict; // 409
                    response.Message = ex.Message;
                    break;

                case BusinessRuleException ex:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest; // 400
                    response.Message = ex.Message;
                    break;

     

                default:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError; // 500
                    response.Message = "Lỗi server không xác định.";
                    break;
            }

            var result = JsonSerializer.Serialize(response, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            await context.Response.WriteAsync(result);
        }
    }
}
