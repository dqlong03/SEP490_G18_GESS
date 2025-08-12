using NUnit.Framework;
using Moq;
using GESS.Model.Auth;
using Microsoft.AspNetCore.Identity;
using GESS.Entity.Entities;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Gess.Repository.Infrastructures;
using GESS.Auth;
using GESS.Service.authservice;
using System;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Google.Apis.Auth;

namespace GESS.Test
{
    [TestFixture]
    public class AuthServiceGoogleLoginTests
    {
        private Mock<UserManager<User>> _mockUserManager;
        private Mock<IJwtService> _mockJwtService;
        private Mock<IUnitOfWork> _mockUnitOfWork;
        private Mock<IMemoryCache> _mockMemoryCache;
        private Mock<IConfiguration> _mockConfig;
        private AuthService _authService;

        [SetUp]
        public void Setup()
        {
            _mockUserManager = new Mock<UserManager<User>>(
                Mock.Of<IUserStore<User>>(), null, null, null, null, null, null, null, null);
            _mockJwtService = new Mock<IJwtService>();
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockMemoryCache = new Mock<IMemoryCache>();
            _mockConfig = new Mock<IConfiguration>();
            _authService = new AuthService(
                _mockUserManager.Object,
                _mockJwtService.Object,
                _mockUnitOfWork.Object,
                _mockMemoryCache.Object,
                _mockConfig.Object
            );
        }

        // ========== GOOGLE LOGIN TEST CASES ==========
        [Test]
        public async Task LoginWithGoogleAsync_ValidTokenExistingUser_ReturnsSuccess()
        {
            // Sử dụng token hợp lệ từ Google (có thể lấy từ Google OAuth playground)
            var googleLoginModel = new GoogleLoginModel { IdToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTAwMDAwMDAwMDAwMC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwMDAwMDAwMDAwMDAiLCJlbWFpbCI6InRlc3RAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJ0ZXN0X2hhc2giLCJpYXQiOjE2MzQ1Njc4NzQsImV4cCI6MTYzNDU3MTQ3NH0.test_signature" };
            var existingUser = new User { UserName = "test@gmail.com", Email = "test@gmail.com", Id = Guid.NewGuid() };
            
            _mockConfig.Setup(c => c["Authentication:Google:ClientId"]).Returns("100000000000000000000.apps.googleusercontent.com");
            _mockUserManager.Setup(m => m.FindByEmailAsync("test@gmail.com")).ReturnsAsync(existingUser);
            _mockUserManager.Setup(m => m.GetRolesAsync(existingUser)).ReturnsAsync(new List<string> { "Admin" });
            _mockJwtService.Setup(j => j.GenerateAccessToken(It.IsAny<IEnumerable<Claim>>())).Returns("google_access_token");
            _mockUnitOfWork.Setup(u => u.RefreshTokenRepository.Create(It.IsAny<RefreshToken>()));
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
            
            var result = await _authService.LoginWithGoogleAsync(googleLoginModel);
            
            Assert.IsTrue(result.Success);
            Assert.AreEqual("google_access_token", result.AccessToken);
            Assert.IsNotNull(result.RefreshToken);
        }

        [Test]
        public async Task LoginWithGoogleAsync_InvalidToken_ReturnsError()
        {
            var googleLoginModel = new GoogleLoginModel { IdToken = "invalid_google_token" };
            _mockConfig.Setup(c => c["Authentication:Google:ClientId"]).Returns("test_client_id");
            
            var result = await _authService.LoginWithGoogleAsync(googleLoginModel);
            
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Token Google không hợp lệ", result.ErrorMessage);
        }

        [Test]
        public async Task LoginWithGoogleAsync_NullToken_ReturnsError()
        {
            var googleLoginModel = new GoogleLoginModel { IdToken = null };
            _mockConfig.Setup(c => c["Authentication:Google:ClientId"]).Returns("test_client_id");
            
            var result = await _authService.LoginWithGoogleAsync(googleLoginModel);
            
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Token Google không hợp lệ", result.ErrorMessage);
        }

        [Test]
        public async Task LoginWithGoogleAsync_UserIsDeleted_ReturnsError()
        {
            // Sử dụng token hợp lệ từ Google
            var googleLoginModel = new GoogleLoginModel { IdToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTAwMDAwMDAwMDAwMC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwMDAwMDAwMDAwMDAiLCJlbWFpbCI6ImRlbGV0ZWRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJ0ZXN0X2hhc2giLCJpYXQiOjE2MzQ1Njc4NzQsImV4cCI6MTYzNDU3MTQ3NH0.test_signature" };
            var deletedUser = new User { UserName = "deleted@gmail.com", Email = "deleted@gmail.com", Id = Guid.NewGuid(), IsDeleted = true };
            
            _mockConfig.Setup(c => c["Authentication:Google:ClientId"]).Returns("100000000000000000000.apps.googleusercontent.com");
            _mockUserManager.Setup(m => m.FindByEmailAsync("deleted@gmail.com")).ReturnsAsync(deletedUser);
            
            var result = await _authService.LoginWithGoogleAsync(googleLoginModel);
            
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Tài khoản đã bị xóa hoặc bị khóa", result.ErrorMessage);
        }

        // ========== GOOGLE DESKTOP LOGIN TEST CASES ==========
        [Test]
        public async Task LoginWithGoogleDesktopAsync_ValidStudent_ReturnsSuccess()
        {
            // Sử dụng token hợp lệ từ Google
            var googleLoginModel = new GoogleLoginModel { IdToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTAwMDAwMDAwMDAwMC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwMDAwMDAwMDAwMDAiLCJlbWFpbCI6InN0dWRlbnRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJ0ZXN0X2hhc2giLCJpYXQiOjE2MzQ1Njc4NzQsImV4cCI6MTYzNDU3MTQ3NH0.test_signature" };
            var existingUser = new User { UserName = "student@gmail.com", Email = "student@gmail.com", Id = Guid.NewGuid(), Code = "HE123456" };
            var student = new Student { StudentId = Guid.NewGuid() };
            
            _mockConfig.Setup(c => c["Authenticationdesk:Google:ClientId"]).Returns("100000000000000000000.apps.googleusercontent.com");
            _mockUserManager.Setup(m => m.FindByEmailAsync("student@gmail.com")).ReturnsAsync(existingUser);
            _mockUserManager.Setup(m => m.AddLoginAsync(It.IsAny<User>(), It.IsAny<UserLoginInfo>())).ReturnsAsync(IdentityResult.Success);
            _mockUserManager.Setup(m => m.GetRolesAsync(existingUser)).ReturnsAsync(new List<string> { "Học sinh" });
            _mockUnitOfWork.Setup(u => u.StudentRepository.GetStudentbyUserId(existingUser.Id)).ReturnsAsync(student);
            _mockJwtService.Setup(j => j.GenerateAccessToken(It.IsAny<IEnumerable<Claim>>())).Returns("desktop_access_token");
            _mockUnitOfWork.Setup(u => u.RefreshTokenRepository.Create(It.IsAny<RefreshToken>()));
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
            
            var result = await _authService.LoginWithGoogleDesktopAsync(googleLoginModel);
            
            Assert.IsTrue(result.Success);
            Assert.AreEqual("desktop_access_token", result.AccessToken);
            Assert.IsNotNull(result.RefreshToken);
            Assert.AreEqual("student@gmail.com", result.Username);
            Assert.AreEqual("HE123456", result.StudentCode);
            Assert.AreEqual(student.StudentId, result.StudentId);
        }

        [Test]
        public async Task LoginWithGoogleDesktopAsync_UserNotExists_ReturnsError()
        {
            // Sử dụng token hợp lệ từ Google
            var googleLoginModel = new GoogleLoginModel { IdToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTAwMDAwMDAwMDAwMC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwMDAwMDAwMDAwMDAiLCJlbWFpbCI6Im5vbmV4aXN0ZW50QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoidGVzdF9oYXNoIiwiaWF0IjoxNjM0NTY3ODc0LCJleHAiOjE2MzQ1NzE0NzR9.test_signature" };
            
            _mockConfig.Setup(c => c["Authenticationdesk:Google:ClientId"]).Returns("100000000000000000000.apps.googleusercontent.com");
            _mockUserManager.Setup(m => m.FindByEmailAsync("nonexistent@gmail.com")).ReturnsAsync((User)null);
            
            var result = await _authService.LoginWithGoogleDesktopAsync(googleLoginModel);
            
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Tài khoản không tồn tại trong hệ thống", result.ErrorMessage);
        }

        [Test]
        public async Task LoginWithGoogleDesktopAsync_UserNotStudent_ReturnsError()
        {
            // Sử dụng token hợp lệ từ Google
            var googleLoginModel = new GoogleLoginModel { IdToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTAwMDAwMDAwMDAwMC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwMDAwMDAwMDAwMDAiLCJlbWFpbCI6InRlYWNoZXJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJ0ZXN0X2hhc2giLCJpYXQiOjE2MzQ1Njc4NzQsImV4cCI6MTYzNDU3MTQ3NH0.test_signature" };
            var existingUser = new User { UserName = "teacher@gmail.com", Email = "teacher@gmail.com", Id = Guid.NewGuid() };
            
            _mockConfig.Setup(c => c["Authenticationdesk:Google:ClientId"]).Returns("100000000000000000000.apps.googleusercontent.com");
            _mockUserManager.Setup(m => m.FindByEmailAsync("teacher@gmail.com")).ReturnsAsync(existingUser);
            _mockUserManager.Setup(m => m.AddLoginAsync(It.IsAny<User>(), It.IsAny<UserLoginInfo>())).ReturnsAsync(IdentityResult.Success);
            _mockUserManager.Setup(m => m.GetRolesAsync(existingUser)).ReturnsAsync(new List<string> { "Giáo viên" });
            
            var result = await _authService.LoginWithGoogleDesktopAsync(googleLoginModel);
            
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Chỉ học sinh mới có quyền đăng nhập qua desktop app", result.ErrorMessage);
        }

        [Test]
        public async Task LoginWithGoogleDesktopAsync_StudentInfoNotFound_ReturnsError()
        {
            // Sử dụng token hợp lệ từ Google
            var googleLoginModel = new GoogleLoginModel { IdToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTAwMDAwMDAwMDAwMC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwMDAwMDAwMDAwMDAiLCJlbWFpbCI6InN0dWRlbnRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJ0ZXN0X2hhc2giLCJpYXQiOjE2MzQ1Njc4NzQsImV4cCI6MTYzNDU3MTQ3NH0.test_signature" };
            var existingUser = new User { UserName = "student@gmail.com", Email = "student@gmail.com", Id = Guid.NewGuid() };
            
            _mockConfig.Setup(c => c["Authenticationdesk:Google:ClientId"]).Returns("100000000000000000000.apps.googleusercontent.com");
            _mockUserManager.Setup(m => m.FindByEmailAsync("student@gmail.com")).ReturnsAsync(existingUser);
            _mockUserManager.Setup(m => m.AddLoginAsync(It.IsAny<User>(), It.IsAny<UserLoginInfo>())).ReturnsAsync(IdentityResult.Success);
            _mockUserManager.Setup(m => m.GetRolesAsync(existingUser)).ReturnsAsync(new List<string> { "Học sinh" });
            _mockUnitOfWork.Setup(u => u.StudentRepository.GetStudentbyUserId(existingUser.Id)).ReturnsAsync((Student)null);
            
            var result = await _authService.LoginWithGoogleDesktopAsync(googleLoginModel);
            
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Không tìm thấy thông tin sinh viên", result.ErrorMessage);
        }
    }
}