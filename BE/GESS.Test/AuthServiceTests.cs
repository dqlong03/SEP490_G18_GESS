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
using Google.Apis.Auth;

namespace GESS.Test
{
    [TestFixture]
    public class AuthServiceTests
    {
        // Khai báo các mock cho các dependency của AuthService
        private Mock<UserManager<User>> _mockUserManager;
        private Mock<IJwtService> _mockJwtService;
        private Mock<IUnitOfWork> _mockUnitOfWork;
        private Mock<IMemoryCache> _mockMemoryCache;
        private Mock<IConfiguration> _mockConfig;
        private AuthService _authService;

        // Hàm này sẽ chạy trước mỗi test case để khởi tạo các mock và AuthService
        [SetUp]
        public void Setup()
        {
            // Khởi tạo mock cho UserManager<User>
            _mockUserManager = new Mock<UserManager<User>>(
                Mock.Of<IUserStore<User>>(), null, null, null, null, null, null, null, null);
            // Khởi tạo mock cho các dependency khác
            _mockJwtService = new Mock<IJwtService>();
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockMemoryCache = new Mock<IMemoryCache>();
            _mockConfig = new Mock<IConfiguration>();

            // Khởi tạo AuthService với các dependency đã mock
            _authService = new AuthService(
                _mockUserManager.Object,
                _mockJwtService.Object,
                _mockUnitOfWork.Object,
                _mockMemoryCache.Object,
                _mockConfig.Object
            );
        }

        // ========== GOOGLE LOGIN TEST CASES ==========

        // Test: Đăng nhập Google thành công với token hợp lệ và user đã tồn tại
        [Test]
        public async Task LoginWithGoogleAsync_ValidTokenExistingUser_ReturnsSuccess()
        {
            // Arrange: Chuẩn bị dữ liệu đầu vào và giả lập các phương thức cần thiết
            var googleLoginModel = new GoogleLoginModel { IdToken = "valid_google_token" };
            var existingUser = new User { UserName = "test@gmail.com", Email = "test@gmail.com", Id = Guid.NewGuid() };

            _mockConfig.Setup(c => c["Authentication:Google:ClientId"]).Returns("test_client_id");
            _mockUserManager.Setup(m => m.FindByEmailAsync("test@gmail.com")).ReturnsAsync(existingUser);
            _mockUserManager.Setup(m => m.GetRolesAsync(existingUser)).ReturnsAsync(new List<string> { "Student" });
            _mockJwtService.Setup(j => j.GenerateAccessToken(It.IsAny<IEnumerable<Claim>>())).Returns("google_access_token");
            _mockUnitOfWork.Setup(u => u.RefreshTokenRepository.Create(It.IsAny<RefreshToken>()));
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            // Act: Gọi hàm LoginWithGoogleAsync
            var result = await _authService.LoginWithGoogleAsync(googleLoginModel);

            // Assert: Kiểm tra kết quả trả về đúng như mong đợi
            Assert.IsTrue(result.Success);
            Assert.AreEqual("google_access_token", result.AccessToken);
            Assert.IsNotNull(result.RefreshToken);
        }

        // Test: Đăng nhập Google thất bại do token không hợp lệ
        [Test]
        public async Task LoginWithGoogleAsync_InvalidToken_ReturnsError()
        {
            // Arrange: Chuẩn bị dữ liệu đầu vào với token không hợp lệ
            var googleLoginModel = new GoogleLoginModel { IdToken = "invalid_google_token" };

            _mockConfig.Setup(c => c["Authentication:Google:ClientId"]).Returns("test_client_id");

            // Act: Gọi hàm LoginWithGoogleAsync
            var result = await _authService.LoginWithGoogleAsync(googleLoginModel);

            // Assert: Kiểm tra kết quả trả về đúng như mong đợi
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Invalid Google token", result.ErrorMessage);
        }

        // Test: Đăng nhập Google thành công với token hợp lệ và user đã tồn tại (UTCID03)
        [Test]
        public async Task LoginWithGoogleAsync_ValidTokenExistingUser2_ReturnsSuccess()
        {
            // Arrange: Chuẩn bị dữ liệu đầu vào và giả lập các phương thức cần thiết
            var googleLoginModel = new GoogleLoginModel { IdToken = "valid_google_token" };
            var existingUser = new User 
            { 
                UserName = "test2@gmail.com", 
                Email = "test2@gmail.com", 
                Id = Guid.NewGuid() 
            };

            _mockConfig.Setup(c => c["Authentication:Google:ClientId"]).Returns("test_client_id");
            _mockUserManager.Setup(m => m.FindByEmailAsync("test2@gmail.com")).ReturnsAsync(existingUser);
            _mockUserManager.Setup(m => m.GetRolesAsync(existingUser)).ReturnsAsync(new List<string> { "Student" });
            _mockJwtService.Setup(j => j.GenerateAccessToken(It.IsAny<IEnumerable<Claim>>())).Returns("google_access_token");
            _mockUnitOfWork.Setup(u => u.RefreshTokenRepository.Create(It.IsAny<RefreshToken>()));
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            // Act: Gọi hàm LoginWithGoogleAsync
            var result = await _authService.LoginWithGoogleAsync(googleLoginModel);

            // Assert: Kiểm tra kết quả trả về đúng như mong đợi
            Assert.IsTrue(result.Success);
            Assert.AreEqual("google_access_token", result.AccessToken);
            Assert.IsNotNull(result.RefreshToken);
        }

        // Test: Đăng nhập Google Desktop thành công với user đã tồn tại và là học sinh
        [Test]
        public async Task LoginWithGoogleDesktopAsync_ValidStudent_ReturnsSuccess()
        {
            // Arrange: Chuẩn bị dữ liệu đầu vào và giả lập các phương thức cần thiết
            var googleLoginModel = new GoogleLoginModel { IdToken = "valid_google_token" };
            var existingUser = new User 
            { 
                UserName = "student@gmail.com", 
                Email = "student@gmail.com", 
                Id = Guid.NewGuid(),
                Code = "HE123456"
            };
            var student = new Student { StudentId = Guid.NewGuid() };

            _mockConfig.Setup(c => c["Authenticationdesk:Google:ClientId"]).Returns("test_desktop_client_id");
            _mockUserManager.Setup(m => m.FindByEmailAsync("student@gmail.com")).ReturnsAsync(existingUser);
            _mockUserManager.Setup(m => m.AddLoginAsync(It.IsAny<User>(), It.IsAny<UserLoginInfo>())).ReturnsAsync(IdentityResult.Success);
            _mockUserManager.Setup(m => m.GetRolesAsync(existingUser)).ReturnsAsync(new List<string> { "Học sinh" });
            _mockUnitOfWork.Setup(u => u.StudentRepository.GetStudentbyUserId(existingUser.Id)).ReturnsAsync(student);
            _mockJwtService.Setup(j => j.GenerateAccessToken(It.IsAny<IEnumerable<Claim>>())).Returns("desktop_access_token");
            _mockUnitOfWork.Setup(u => u.RefreshTokenRepository.Create(It.IsAny<RefreshToken>()));
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            // Act: Gọi hàm LoginWithGoogleDesktopAsync
            var result = await _authService.LoginWithGoogleDesktopAsync(googleLoginModel);

            // Assert: Kiểm tra kết quả trả về đúng như mong đợi
            Assert.IsTrue(result.Success);
            Assert.AreEqual("desktop_access_token", result.AccessToken);
            Assert.IsNotNull(result.RefreshToken);
            Assert.AreEqual("student@gmail.com", result.Username);
            Assert.AreEqual("HE123456", result.StudentCode);
            Assert.AreEqual(student.StudentId, result.StudentId);
        }

        // Test: Đăng nhập Google Desktop thất bại do user không tồn tại
        [Test]
        public async Task LoginWithGoogleDesktopAsync_UserNotExists_ReturnsError()
        {
            // Arrange: Chuẩn bị dữ liệu đầu vào và giả lập các phương thức cần thiết
            var googleLoginModel = new GoogleLoginModel { IdToken = "valid_google_token" };

            _mockConfig.Setup(c => c["Authenticationdesk:Google:ClientId"]).Returns("test_desktop_client_id");
            _mockUserManager.Setup(m => m.FindByEmailAsync("test@gmail.com")).ReturnsAsync((User)null);

            // Act: Gọi hàm LoginWithGoogleDesktopAsync
            var result = await _authService.LoginWithGoogleDesktopAsync(googleLoginModel);

            // Assert: Kiểm tra kết quả trả về đúng như mong đợi
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Tài khoản không tồn tại trong hệ thống", result.ErrorMessage);
        }

        // Test: Đăng nhập Google Desktop thất bại do user không phải học sinh
        [Test]
        public async Task LoginWithGoogleDesktopAsync_UserNotStudent_ReturnsError()
        {
            // Arrange: Chuẩn bị dữ liệu đầu vào và giả lập các phương thức cần thiết
            var googleLoginModel = new GoogleLoginModel { IdToken = "valid_google_token" };
            var existingUser = new User 
            { 
                UserName = "teacher@gmail.com", 
                Email = "teacher@gmail.com", 
                Id = Guid.NewGuid() 
            };

            _mockConfig.Setup(c => c["Authenticationdesk:Google:ClientId"]).Returns("test_desktop_client_id");
            _mockUserManager.Setup(m => m.FindByEmailAsync("teacher@gmail.com")).ReturnsAsync(existingUser);
            _mockUserManager.Setup(m => m.AddLoginAsync(It.IsAny<User>(), It.IsAny<UserLoginInfo>())).ReturnsAsync(IdentityResult.Success);
            _mockUserManager.Setup(m => m.GetRolesAsync(existingUser)).ReturnsAsync(new List<string> { "Giáo viên" });

            // Act: Gọi hàm LoginWithGoogleDesktopAsync
            var result = await _authService.LoginWithGoogleDesktopAsync(googleLoginModel);

            // Assert: Kiểm tra kết quả trả về đúng như mong đợi
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Chỉ học sinh mới có quyền đăng nhập qua desktop app", result.ErrorMessage);
        }

        // Test: Đăng nhập Google Desktop thất bại do không tìm thấy thông tin sinh viên
        [Test]
        public async Task LoginWithGoogleDesktopAsync_StudentInfoNotFound_ReturnsError()
        {
            // Arrange: Chuẩn bị dữ liệu đầu vào và giả lập các phương thức cần thiết
            var googleLoginModel = new GoogleLoginModel { IdToken = "valid_google_token" };
            var existingUser = new User 
            { 
                UserName = "student@gmail.com", 
                Email = "student@gmail.com", 
                Id = Guid.NewGuid() 
            };

            _mockConfig.Setup(c => c["Authenticationdesk:Google:ClientId"]).Returns("test_desktop_client_id");
            _mockUserManager.Setup(m => m.FindByEmailAsync("student@gmail.com")).ReturnsAsync(existingUser);
            _mockUserManager.Setup(m => m.AddLoginAsync(It.IsAny<User>(), It.IsAny<UserLoginInfo>())).ReturnsAsync(IdentityResult.Success);
            _mockUserManager.Setup(m => m.GetRolesAsync(existingUser)).ReturnsAsync(new List<string> { "Học sinh" });
            _mockUnitOfWork.Setup(u => u.StudentRepository.GetStudentbyUserId(existingUser.Id)).ReturnsAsync((Student)null);

            // Act: Gọi hàm LoginWithGoogleDesktopAsync
            var result = await _authService.LoginWithGoogleDesktopAsync(googleLoginModel);

            // Assert: Kiểm tra kết quả trả về đúng như mong đợi
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Không tìm thấy thông tin sinh viên", result.ErrorMessage);
        }
    }
} 