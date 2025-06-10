using GESS.Model.Email;
using GESS.Service.otp;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OtpController : ControllerBase
    {
        private readonly IOtpService _otpService;

        public OtpController(IOtpService otpService)
        {
            _otpService = otpService;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendOtp([FromBody] EmailDTO emailModel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid email model" });
            }

            try
            {
                var result = await _otpService.SendOtpAsync(emailModel.Email);
                return result
                    ? Ok(new { message = "OTP sent" })
                    : StatusCode(500, new { message = "Failed to send OTP" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending OTP: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        [HttpPost("verify")]
        public IActionResult VerifyOtp([FromBody] VerifyOtpDTO request)
        {
            if (request == null || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Otp))
                return BadRequest("Email and OTP are required.");

            var result = _otpService.VerifyOtp(request);
            return result ? Ok("OTP verified") : BadRequest("Invalid or expired OTP");
        }

    }
}
