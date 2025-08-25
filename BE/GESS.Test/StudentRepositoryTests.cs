using NUnit.Framework;
using Moq;
using GESS.Model.Exam;
using GESS.Entity.Entities;
using GESS.Entity.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GESS.Common;
using GESS.Repository.Implement;

namespace GESS.Test
{
    [TestFixture]
    public class StudentRepositoryTests
    {
        private GessDbContext _context;
        private Mock<UserManager<User>> _mockUserManager;
        private StudentRepository _studentRepository;

        [SetUp]
        public void Setup()
        {
            // Khởi tạo mock cho UserManager<User>
            _mockUserManager = new Mock<UserManager<User>>(
                Mock.Of<IUserStore<User>>(), null, null, null, null, null, null, null, null);

            // Tạo in-memory database thay vì mock DbContext
            var options = new DbContextOptionsBuilder<GessDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new GessDbContext(options);

            // Khởi tạo StudentRepository với in-memory database
            _studentRepository = new StudentRepository(_context, _mockUserManager.Object);
        }

        [TearDown]
        public void TearDown()
        {
            _context?.Dispose();
        }

        // ========== EXAM SCORE HISTORY TEST CASES ==========

      
        [Test]
        public async Task GetHistoryExamOfStudentBySubIdAsync_NoData_ReturnsEmptyList()
        {
            // Arrange: Chuẩn bị dữ liệu test với studentId không có dữ liệu
            var invalidStudentId = Guid.NewGuid();
            var subjectId = 1;
            var semesterId = 1;
            var year = 2024;

            // Act: Gọi method cần test
            var result = await _studentRepository.GetHistoryExamOfStudentBySubIdAsync(semesterId, year, subjectId, invalidStudentId);

            // Assert: Kiểm tra kết quả trả về danh sách rỗng
            Assert.IsNotNull(result);
            Assert.AreEqual(0, result.Count);
        }

      
    }
} 