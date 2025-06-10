using System;

namespace GESS.Model.Auth
{
    public class LoginModel
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string RecaptchaToken { get; set; }
    }

    public class GoogleLoginModel
    {
        public string IdToken { get; set; }
    }

    public class RefreshTokenModel
    {
        public string RefreshToken { get; set; }
    }

   

    public class OtpModel
    {
        public string Otp { get; set; }
        public DateTime ExpiryTime { get; set; }
    }
    public class LoginResult
    {
        public bool Success { get; set; }
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public string ErrorMessage { get; set; }
    }
} 