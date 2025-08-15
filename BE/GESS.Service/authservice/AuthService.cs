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
using GESS.Common;

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

                // Check if account is active
                if (!user.IsActive)
                {
                    return new LoginResult
                    {
                        Success = false,
                        ErrorMessage = "Tài khoản không hoạt động hoặc đã bị khóa"
                    };
                }

                var userRoles = await _userManager.GetRolesAsync(user);
                // Only allow Admin, Teacher, Examination, HeadOfDepartment
                var allowedRoles = new[] {
            GESS.Common.PredefinedRole.ADMIN_ROLE,
            GESS.Common.PredefinedRole.TEACHER_ROLE,
            GESS.Common.PredefinedRole.EXAMINATION_ROLE,
            GESS.Common.PredefinedRole.HEADOFDEPARTMENT_ROLE
        };
                if (!userRoles.Any(r => allowedRoles.Contains(r)))
                {
                    return new LoginResult
                    {
                        Success = false,
                        ErrorMessage = "Bạn không có quyền truy cập hệ thống"
                    };
                }

                // Tạo claims giống LoginAsync
                var claims = new List<Claim>
        {
            new Claim("Username", user.UserName),
            new Claim("Userid", user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

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
                return new LoginResult { Success = false, ErrorMessage = "Token Google không hợp lệ" };
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
                    "Khảo thí" => "EXAMINATION",
                    "Giáo viên" => "TEACHER",
                    "Sinh viên" => "STUDENT",
                    "Trưởng bộ môn" => "HOD",
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
            Console.WriteLine(model.Email);
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

        // Xử lý đăng nhập với Google cho Desktop App - chỉ cho phép học sinh đã có trong hệ thống
        public async Task<GoogleLoginDesktopResult> LoginWithGoogleDesktopAsync(GoogleLoginModel model)
        {
            try
            {
                // Validate Google token
                var payload = await GoogleJsonWebSignature.ValidateAsync(model.IdToken, new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _configuration["Authenticationdesk:Google:ClientId"] }
                });

                // Tìm user theo email
                var user = await _userManager.FindByEmailAsync(payload.Email);
                if (user == null)
                {
                    return new GoogleLoginDesktopResult { Success = false, ErrorMessage = "Tài khoản không tồn tại trong hệ thống" };
                }

                // Thêm thông tin đăng nhập Google vào AspNetUserLogins
                await _userManager.AddLoginAsync(user, new UserLoginInfo("Google", payload.Subject, "Google"));

                // Kiểm tra role - chỉ cho phép học sinh đăng nhập
                var userRoles = await _userManager.GetRolesAsync(user);
                if (!userRoles.Contains(PredefinedRole.STUDENT_ROLE))
                {
                    return new GoogleLoginDesktopResult { Success = false, ErrorMessage = "Chỉ học sinh mới có quyền đăng nhập qua desktop app" };
                }

                // Tìm thông tin sinh viên
                var student = await _unitOfWork.StudentRepository.GetStudentbyUserId(user.Id);
                if (student == null)
                {
                    return new GoogleLoginDesktopResult { Success = false, ErrorMessage = "Không tìm thấy thông tin sinh viên" };
                }

                // Tạo claims
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                };

                foreach (var role in userRoles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
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

                return new GoogleLoginDesktopResult
                {
                    Success = true,
                    AccessToken = accessToken,
                    RefreshToken = refreshToken.Token,
                    Username = user.UserName,
                    StudentCode = user.Code,
                    StudentId = student.StudentId,
                    StudentName = user.Fullname
                };
            }
            catch (InvalidJwtException ex)
            {
                return new GoogleLoginDesktopResult { Success = false, ErrorMessage = "Token Google không hợp lệ: " + ex.Message };
            }
            catch (ArgumentException ex)
            {
                return new GoogleLoginDesktopResult { Success = false, ErrorMessage = "Dữ liệu đầu vào không hợp lệ: " + ex.Message };
            }
            catch (Exception ex)
            {
                // Log chi tiết lỗi để debug
                return new GoogleLoginDesktopResult { Success = false, ErrorMessage = $"Lỗi hệ thống: {ex.GetType().Name} - {ex.Message}" };
            }
        }
    }
}
