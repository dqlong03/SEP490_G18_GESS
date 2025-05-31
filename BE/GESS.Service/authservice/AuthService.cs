using GESS.Auth;
using GESS.Entity.Entities;
using GESS.Model;
using Gess.Repository.Infrastructures;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.authservice
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly IJwtService _jwtService;
        private readonly IUnitOfWork _unitOfWork;

        public AuthService(UserManager<User> userManager, IJwtService jwtService, IUnitOfWork unitOfWork)
        {
            _userManager = userManager;
            _jwtService = jwtService;
            _unitOfWork = unitOfWork;
        }

        public async Task<LoginResult> LoginAsync(LoginModel loginModel)
        {
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
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var userRoles = await _userManager.GetRolesAsync(user);
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
    }
}
