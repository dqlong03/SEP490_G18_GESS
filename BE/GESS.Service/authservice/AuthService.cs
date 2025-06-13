using Gess.Repository.Infrastructures;
using GESS.Auth;
using GESS.Entity.Entities;
using GESS.Model.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Google.Apis.Auth;

namespace GESS.Service.authservice
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly IJwtService _jwtService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMemoryCache _memoryCache;
        private readonly IConfiguration _configuration;


        public AuthService(UserManager<User> userManager, IJwtService jwtService, IUnitOfWork unitOfWork, IMemoryCache memoryCache, IConfiguration configuration)
        {
            _userManager = userManager;
            _jwtService = jwtService;
            _unitOfWork = unitOfWork;
            _memoryCache = memoryCache;
            _configuration = configuration;
        }

        // Xử lý đăng nhập với Google
        public async Task<LoginResult> LoginWithGoogleAsync(GoogleLoginModel model)
        {
            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(model.IdToken, new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _configuration["Authentication:Google:ClientId"] }
                });

                var user = await _userManager.FindByEmailAsync(payload.Email);
                if (user == null)
                {
                    user = new User
                    {
                        UserName = payload.Email,
                        Email = payload.Email,
                        EmailConfirmed = true,
                        Fullname = payload.GivenName,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    var result = await _userManager.CreateAsync(user);
                    if (!result.Succeeded)
                    {
                        return new LoginResult { Success = false, ErrorMessage = "Cannot create user" };
                    }
                    await _userManager.AddToRoleAsync(user, "Student");
                }

                // Tạo claims giống LoginAsync
                var claims = new List<Claim>
        {
            new Claim("Username", user.UserName),
            new Claim("Userid", user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

                var userRoles = await _userManager.GetRolesAsync(user);
                foreach (var role in userRoles)
                {
                    claims.Add(new Claim("Role", role));
                }

                var accessToken = _jwtService.GenerateAccessToken(claims);

                // Tạo refresh token
                var refreshToken = new RefreshToken
                {
                    Id = Guid.NewGuid(),
                    Token = Guid.NewGuid().ToString(),
                    IssuedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddDays(30),
                    IsRevoked = false,
                    UserId = user.Id
                };
                _unitOfWork.RefreshTokenRepository.Create(refreshToken);
                await _unitOfWork.SaveChangesAsync();

                return new LoginResult
                {
                    Success = true,
                    AccessToken = accessToken,
                    RefreshToken = refreshToken.Token
                };
            }
            catch
            {
                return new LoginResult { Success = false, ErrorMessage = "Invalid Google token" };
            }
        }


        //xử lý recaptcha login
        private async Task<bool> VerifyRecaptchaAsync(string recaptchaToken)
        {
            var secretKey = _configuration["Recaptcha:SecretKey"];
            using var httpClient = new HttpClient();
            var content = new FormUrlEncodedContent(new[]
            {
            new KeyValuePair<string, string>("secret", secretKey),
            new KeyValuePair<string, string>("response", recaptchaToken)
        });
            var response = await httpClient.PostAsync("https://www.google.com/recaptcha/api/siteverify", content);
            var json = await response.Content.ReadAsStringAsync();
            using var doc = System.Text.Json.JsonDocument.Parse(json);
            return doc.RootElement.GetProperty("success").GetBoolean();
        }



        public async Task<LoginResult> LoginAsync(LoginModel loginModel)
        {
            if (string.IsNullOrEmpty(loginModel.RecaptchaToken) || !await VerifyRecaptchaAsync(loginModel.RecaptchaToken))
            {
                return new LoginResult
                {
                    Success = false,
                    ErrorMessage = "Xác thực reCAPTCHA thất bại"
                };
            }
            if (string.IsNullOrEmpty(loginModel.Username) || string.IsNullOrEmpty(loginModel.Password))
            {
                return new LoginResult
                {
                    Success = false,
                    ErrorMessage = "Username và password không được để trống"
                };
            }

            var user = await _userManager.FindByNameAsync(loginModel.Username);
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginModel.Password))
            {
                return new LoginResult
                {
                    Success = false,
                    ErrorMessage = "Tên đăng nhập hoặc mật khẩu không đúng"
                };
            }

            var claims = new List<Claim>
            {
                new Claim("Username", user.UserName),
                new Claim("Userid", user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var userRoles = await _userManager.GetRolesAsync(user);
            foreach (var role in userRoles)
            {
                string claimRole = role switch
                {
                    "Khảo thí" => "Examination",
                    "Giáo viên" => "Teacher",
                    "Sinh viên" => "Student",
                    "Trưởng bộ môn" => "Teacher Leader",
                    _ => role
                };
                claims.Add(new Claim("Role", claimRole));
            }


            var accessToken = _jwtService.GenerateAccessToken(claims);

            // Tạo refresh token
            var refreshToken = new RefreshToken
            {
                Id = Guid.NewGuid(),
                Token = Guid.NewGuid().ToString(),
                IssuedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(30),
                IsRevoked = false,
                UserId = user.Id
            };
            _unitOfWork.RefreshTokenRepository.Create(refreshToken);
            await _unitOfWork.SaveChangesAsync();

            return new LoginResult
            {
                Success = true,
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token
            };
        }

        public async Task<LoginResult> RefreshTokenAsync(string refreshToken)
        {
            if (string.IsNullOrEmpty(refreshToken))
            {
                return new LoginResult { Success = false, ErrorMessage = "Refresh token không được để trống" };
            }

            var storedToken = await _unitOfWork.RefreshTokenRepository.GetByTokenAsync(refreshToken);
            if (storedToken == null || storedToken.ExpiresAt < DateTime.UtcNow || storedToken.IsRevoked)
            {
                return new LoginResult { Success = false, ErrorMessage = "Refresh token không hợp lệ hoặc đã hết hạn" };
            }

            // Tạo access token mới
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, storedToken.User.UserName),
                new Claim(ClaimTypes.NameIdentifier, storedToken.User.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var userRoles = await _userManager.GetRolesAsync(storedToken.User);
            foreach (var role in userRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var newAccessToken = _jwtService.GenerateAccessToken(claims);

            // Tạo refresh token mới và thu hồi token cũ
            var newRefreshToken = new RefreshToken
            {
                Id = Guid.NewGuid(),
                Token = Guid.NewGuid().ToString(),
                IssuedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(30),
                IsRevoked = false,
                UserId = storedToken.UserId
            };
            await _unitOfWork.RefreshTokenRepository.RevokeTokenAsync(refreshToken);
            _unitOfWork.RefreshTokenRepository.Create(newRefreshToken);
            await _unitOfWork.SaveChangesAsync();

            return new LoginResult
            {
                Success = true,
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken.Token
            };
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDTO model)
        {
            // 1. Kiểm tra xác minh OTP
            //if (!_memoryCache.TryGetValue("otp_verified_" + model.Email, out _))
            //{
            //    return false; // Chưa xác minh OTP
            //}

            // 2. Kiểm tra mật khẩu nhập lại
            if (model.NewPassword != model.ConfirmPassword)
            {
                return false;
            }

            // 3. Lấy người dùng theo email
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return false;

            // 4. Đặt lại mật khẩu
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);

            if (result.Succeeded)
            {
                _memoryCache.Remove("otp_verified_" + model.Email); // Xóa cache sau khi đổi mật khẩu
                return true;
            }

            return false;
        }

    }
}
