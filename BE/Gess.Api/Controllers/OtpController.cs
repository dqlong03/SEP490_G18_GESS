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
        public async Task<IActionResult> SendOtp([FromBody] string email)
        {
            var result = await _otpService.SendOtpAsync(email);
            return result ? Ok("OTP sent") : StatusCode(500, "Failed to send OTP");
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
