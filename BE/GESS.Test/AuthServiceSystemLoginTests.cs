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
using System.Net.Http;
using System.Text.Json;

namespace GESS.Test
{
    [TestFixture]
    public class AuthServiceSystemLoginTests
    {
        private Mock<UserManager<User>> _mockUserManager;
        private Mock<IJwtService> _mockJwtService;
        private Mock<IUnitOfWork> _mockUnitOfWork;
        private Mock<IMemoryCache> _mockMemoryCache;
        private Mock<IConfiguration> _mockConfig;
        private Mock<IHttpClientFactory> _mockHttpClientFactory;
        private Mock<HttpClient> _mockHttpClient;
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
            _mockHttpClientFactory = new Mock<IHttpClientFactory>();
            _mockHttpClient = new Mock<HttpClient>();
            
            _authService = new AuthService(
                _mockUserManager.Object,
                _mockJwtService.Object,
                _mockUnitOfWork.Object,
                _mockMemoryCache.Object,
                _mockConfig.Object
            );
        }

        // ========== VALID LOGIN TEST CASES ==========
        [Test]
        public async Task LoginAsync_ValidCredentials_ReturnsSuccess()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "user1", 
                Password = "password1",
                RecaptchaToken = "valid_captcha_token"
            };
            var user = new User 
            { 
                UserName = "user1", 
                Email = "user1@gmail.com", 
                Id = Guid.NewGuid(), 
                IsActive = true,
                Fullname = "Test User"
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            _mockUserManager.Setup(m => m.FindByNameAsync("user1")).ReturnsAsync(user);
            _mockUserManager.Setup(m => m.CheckPasswordAsync(user, "password1")).ReturnsAsync(true);
            _mockUserManager.Setup(m => m.GetRolesAsync(user)).ReturnsAsync(new List<string> { "Student" });
            _mockJwtService.Setup(j => j.GenerateAccessToken(It.IsAny<IEnumerable<Claim>>())).Returns("access_token");
            _mockUnitOfWork.Setup(u => u.RefreshTokenRepository.Create(It.IsAny<RefreshToken>()));
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsTrue(result.Success);
            Assert.AreEqual("access_token", result.AccessToken);
            Assert.IsNotNull(result.RefreshToken);
        }

        [Test]
        public async Task LoginAsync_ValidCredentialsWithMultipleRoles_ReturnsSuccess()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "admin", 
                Password = "admin123",
                RecaptchaToken = "valid_captcha_token"
            };
            var user = new User 
            { 
                UserName = "admin", 
                Email = "admin@gmail.com", 
                Id = Guid.NewGuid(), 
                IsActive = true,
                Fullname = "Admin User"
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            _mockUserManager.Setup(m => m.FindByNameAsync("admin")).ReturnsAsync(user);
            _mockUserManager.Setup(m => m.CheckPasswordAsync(user, "admin123")).ReturnsAsync(true);
            _mockUserManager.Setup(m => m.GetRolesAsync(user)).ReturnsAsync(new List<string> { "Admin", "Teacher" });
            _mockJwtService.Setup(j => j.GenerateAccessToken(It.IsAny<IEnumerable<Claim>>())).Returns("admin_access_token");
            _mockUnitOfWork.Setup(u => u.RefreshTokenRepository.Create(It.IsAny<RefreshToken>()));
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsTrue(result.Success);
            Assert.AreEqual("admin_access_token", result.AccessToken);
            Assert.IsNotNull(result.RefreshToken);
        }

        // ========== INVALID CREDENTIALS TEST CASES ==========
        [Test]
        public async Task LoginAsync_InvalidPassword_ReturnsError()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "user1", 
                Password = "wrongpassword",
                RecaptchaToken = "valid_captcha_token"
            };
            var user = new User 
            { 
                UserName = "user1", 
                Email = "user1@gmail.com", 
                Id = Guid.NewGuid(), 
                IsActive = true 
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            _mockUserManager.Setup(m => m.FindByNameAsync("user1")).ReturnsAsync(user);
            _mockUserManager.Setup(m => m.CheckPasswordAsync(user, "wrongpassword")).ReturnsAsync(false);
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Tên đăng nhập hoặc mật khẩu không đúng", result.ErrorMessage);
        }

        [Test]
        public async Task LoginAsync_UserNotFound_ReturnsError()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "nonexistent", 
                Password = "password123",
                RecaptchaToken = "valid_captcha_token"
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            _mockUserManager.Setup(m => m.FindByNameAsync("nonexistent")).ReturnsAsync((User)null);
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Tên đăng nhập hoặc mật khẩu không đúng", result.ErrorMessage);
        }

        // ========== USER STATUS TEST CASES ==========
        [Test]
        public async Task LoginAsync_UserLockedOut_ReturnsError()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "user1", 
                Password = "password1",
                RecaptchaToken = "valid_captcha_token"
            };
            var user = new User 
            { 
                UserName = "user1", 
                Email = "user1@gmail.com", 
                Id = Guid.NewGuid(), 
                IsActive = false 
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            _mockUserManager.Setup(m => m.FindByNameAsync("user1")).ReturnsAsync(user);
            _mockUserManager.Setup(m => m.CheckPasswordAsync(user, "password1")).ReturnsAsync(true);
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Tài khoản đã bị khóa hoặc bị xóa", result.ErrorMessage);
        }

        [Test]
        public async Task LoginAsync_UserDeleted_ReturnsError()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "deleted_user", 
                Password = "password123",
                RecaptchaToken = "valid_captcha_token"
            };
            var user = new User 
            { 
                UserName = "deleted_user", 
                Email = "deleted@gmail.com", 
                Id = Guid.NewGuid(), 
                IsActive = true,
                IsDeleted = true
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            _mockUserManager.Setup(m => m.FindByNameAsync("deleted_user")).ReturnsAsync(user);
            _mockUserManager.Setup(m => m.CheckPasswordAsync(user, "password123")).ReturnsAsync(true);
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Tài khoản đã bị khóa hoặc bị xóa", result.ErrorMessage);
        }

        // ========== INPUT VALIDATION TEST CASES ==========
        [Test]
        public async Task LoginAsync_EmptyUsername_ReturnsError()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "", 
                Password = "password123",
                RecaptchaToken = "valid_captcha_token"
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Username và password không được để trống", result.ErrorMessage);
        }

        [Test]
        public async Task LoginAsync_EmptyPassword_ReturnsError()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "user1", 
                Password = "",
                RecaptchaToken = "valid_captcha_token"
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Username và password không được để trống", result.ErrorMessage);
        }

        [Test]
        public async Task LoginAsync_NullUsername_ReturnsError()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = null, 
                Password = "password123",
                RecaptchaToken = "valid_captcha_token"
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Username và password không được để trống", result.ErrorMessage);
        }

        [Test]
        public async Task LoginAsync_NullPassword_ReturnsError()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "user1", 
                Password = null,
                RecaptchaToken = "valid_captcha_token"
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Username và password không được để trống", result.ErrorMessage);
        }

        [Test]
        public async Task LoginAsync_WhitespaceUsername_ReturnsError()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "   ", 
                Password = "password123",
                RecaptchaToken = "valid_captcha_token"
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Username và password không được để trống", result.ErrorMessage);
        }

        // ========== CAPTCHA TEST CASES ==========
        [Test]
        public async Task LoginAsync_EmptyCaptchaToken_ReturnsError()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "user1", 
                Password = "password123",
                RecaptchaToken = ""
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Xác thực reCAPTCHA thất bại", result.ErrorMessage);
        }

        [Test]
        public async Task LoginAsync_NullCaptchaToken_ReturnsError()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "user1", 
                Password = "password123",
                RecaptchaToken = null
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Xác thực reCAPTCHA thất bại", result.ErrorMessage);
        }

        [Test]
        public async Task LoginAsync_InvalidCaptchaToken_ReturnsError()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "user1", 
                Password = "password123",
                RecaptchaToken = "invalid_captcha_token"
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Xác thực reCAPTCHA thất bại", result.ErrorMessage);
        }

        // ========== ROLE MAPPING TEST CASES ==========
        [Test]
        public async Task LoginAsync_StudentRole_MapsCorrectly()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "student", 
                Password = "password123",
                RecaptchaToken = "valid_captcha_token"
            };
            var user = new User 
            { 
                UserName = "student", 
                Email = "student@gmail.com", 
                Id = Guid.NewGuid(), 
                IsActive = true 
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            _mockUserManager.Setup(m => m.FindByNameAsync("student")).ReturnsAsync(user);
            _mockUserManager.Setup(m => m.CheckPasswordAsync(user, "password123")).ReturnsAsync(true);
            _mockUserManager.Setup(m => m.GetRolesAsync(user)).ReturnsAsync(new List<string> { "Sinh viên" });
            _mockJwtService.Setup(j => j.GenerateAccessToken(It.IsAny<IEnumerable<Claim>>())).Returns("student_token");
            _mockUnitOfWork.Setup(u => u.RefreshTokenRepository.Create(It.IsAny<RefreshToken>()));
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsTrue(result.Success);
            Assert.AreEqual("student_token", result.AccessToken);
        }

        [Test]
        public async Task LoginAsync_TeacherRole_MapsCorrectly()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "teacher", 
                Password = "password123",
                RecaptchaToken = "valid_captcha_token"
            };
            var user = new User 
            { 
                UserName = "teacher", 
                Email = "teacher@gmail.com", 
                Id = Guid.NewGuid(), 
                IsActive = true 
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            _mockUserManager.Setup(m => m.FindByNameAsync("teacher")).ReturnsAsync(user);
            _mockUserManager.Setup(m => m.CheckPasswordAsync(user, "password123")).ReturnsAsync(true);
            _mockUserManager.Setup(m => m.GetRolesAsync(user)).ReturnsAsync(new List<string> { "Giáo viên" });
            _mockJwtService.Setup(j => j.GenerateAccessToken(It.IsAny<IEnumerable<Claim>>())).Returns("teacher_token");
            _mockUnitOfWork.Setup(u => u.RefreshTokenRepository.Create(It.IsAny<RefreshToken>()));
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsTrue(result.Success);
            Assert.AreEqual("teacher_token", result.AccessToken);
        }

        [Test]
        public async Task LoginAsync_ExaminationRole_MapsCorrectly()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "exam", 
                Password = "password123",
                RecaptchaToken = "valid_captcha_token"
            };
            var user = new User 
            { 
                UserName = "exam", 
                Email = "exam@gmail.com", 
                Id = Guid.NewGuid(), 
                IsActive = true 
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            _mockUserManager.Setup(m => m.FindByNameAsync("exam")).ReturnsAsync(user);
            _mockUserManager.Setup(m => m.CheckPasswordAsync(user, "password123")).ReturnsAsync(true);
            _mockUserManager.Setup(m => m.GetRolesAsync(user)).ReturnsAsync(new List<string> { "Khảo thí" });
            _mockJwtService.Setup(j => j.GenerateAccessToken(It.IsAny<IEnumerable<Claim>>())).Returns("exam_token");
            _mockUnitOfWork.Setup(u => u.RefreshTokenRepository.Create(It.IsAny<RefreshToken>()));
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsTrue(result.Success);
            Assert.AreEqual("exam_token", result.AccessToken);
        }

        [Test]
        public async Task LoginAsync_HeadOfDepartmentRole_MapsCorrectly()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "hod", 
                Password = "password123",
                RecaptchaToken = "valid_captcha_token"
            };
            var user = new User 
            { 
                UserName = "hod", 
                Email = "hod@gmail.com", 
                Id = Guid.NewGuid(), 
                IsActive = true 
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            _mockUserManager.Setup(m => m.FindByNameAsync("hod")).ReturnsAsync(user);
            _mockUserManager.Setup(m => m.CheckPasswordAsync(user, "password123")).ReturnsAsync(true);
            _mockUserManager.Setup(m => m.GetRolesAsync(user)).ReturnsAsync(new List<string> { "Trưởng bộ môn" });
            _mockJwtService.Setup(j => j.GenerateAccessToken(It.IsAny<IEnumerable<Claim>>())).Returns("hod_token");
            _mockUnitOfWork.Setup(u => u.RefreshTokenRepository.Create(It.IsAny<RefreshToken>()));
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsTrue(result.Success);
            Assert.AreEqual("hod_token", result.AccessToken);
        }

        // ========== EDGE CASES ==========
        [Test]
        public async Task LoginAsync_UserWithNoRoles_ReturnsSuccess()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "norole", 
                Password = "password123",
                RecaptchaToken = "valid_captcha_token"
            };
            var user = new User 
            { 
                UserName = "norole", 
                Email = "norole@gmail.com", 
                Id = Guid.NewGuid(), 
                IsActive = true 
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            _mockUserManager.Setup(m => m.FindByNameAsync("norole")).ReturnsAsync(user);
            _mockUserManager.Setup(m => m.CheckPasswordAsync(user, "password123")).ReturnsAsync(true);
            _mockUserManager.Setup(m => m.GetRolesAsync(user)).ReturnsAsync(new List<string>());
            _mockJwtService.Setup(j => j.GenerateAccessToken(It.IsAny<IEnumerable<Claim>>())).Returns("norole_token");
            _mockUnitOfWork.Setup(u => u.RefreshTokenRepository.Create(It.IsAny<RefreshToken>()));
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsTrue(result.Success);
            Assert.AreEqual("norole_token", result.AccessToken);
        }

        [Test]
        public async Task LoginAsync_UserWithUnknownRole_ReturnsSuccess()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "unknown", 
                Password = "password123",
                RecaptchaToken = "valid_captcha_token"
            };
            var user = new User 
            { 
                UserName = "unknown", 
                Email = "unknown@gmail.com", 
                Id = Guid.NewGuid(), 
                IsActive = true 
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            _mockUserManager.Setup(m => m.FindByNameAsync("unknown")).ReturnsAsync(user);
            _mockUserManager.Setup(m => m.CheckPasswordAsync(user, "password123")).ReturnsAsync(true);
            _mockUserManager.Setup(m => m.GetRolesAsync(user)).ReturnsAsync(new List<string> { "UnknownRole" });
            _mockJwtService.Setup(j => j.GenerateAccessToken(It.IsAny<IEnumerable<Claim>>())).Returns("unknown_token");
            _mockUnitOfWork.Setup(u => u.RefreshTokenRepository.Create(It.IsAny<RefreshToken>()));
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsTrue(result.Success);
            Assert.AreEqual("unknown_token", result.AccessToken);
        }

        [Test]
        public async Task LoginAsync_SaveChangesFails_ReturnsError()
        {
            // Arrange
            var loginModel = new LoginModel 
            { 
                Username = "user1", 
                Password = "password1",
                RecaptchaToken = "valid_captcha_token"
            };
            var user = new User 
            { 
                UserName = "user1", 
                Email = "user1@gmail.com", 
                Id = Guid.NewGuid(), 
                IsActive = true 
            };
            
            _mockConfig.Setup(c => c["Recaptcha:SecretKey"]).Returns("test_secret_key");
            _mockUserManager.Setup(m => m.FindByNameAsync("user1")).ReturnsAsync(user);
            _mockUserManager.Setup(m => m.CheckPasswordAsync(user, "password1")).ReturnsAsync(true);
            _mockUserManager.Setup(m => m.GetRolesAsync(user)).ReturnsAsync(new List<string> { "Student" });
            _mockJwtService.Setup(j => j.GenerateAccessToken(It.IsAny<IEnumerable<Claim>>())).Returns("access_token");
            _mockUnitOfWork.Setup(u => u.RefreshTokenRepository.Create(It.IsAny<RefreshToken>()));
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(0); // Save changes fails
            
            // Act
            var result = await _authService.LoginAsync(loginModel);
            
            // Assert
            Assert.IsFalse(result.Success);
            // Note: This test might need adjustment based on how AuthService handles save failures
        }
    }
}