using NUnit.Framework;
using Microsoft.EntityFrameworkCore;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Implement;
using GESS.Model.Teacher;
using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;

namespace GESS.Test
{
    [TestFixture]
    public class GetAllTeacherHaveSubjectTests
    {
        private GessDbContext _context;
        private AssignGradeCreateExamRepository _repository;

        [SetUp]
        public void Setup()
        {
            // Khởi tạo In-Memory Database cho testing
            var options = new DbContextOptionsBuilder<GessDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new GessDbContext(options);

            // Khởi tạo repository
            _repository = new AssignGradeCreateExamRepository(_context);

            // Seed dữ liệu test
            SeedTestData();
        }

        [TearDown]
        public void TearDown()
        {
            _context?.Dispose();
        }

        private void SeedTestData()
        {
            // Tạo Subject
            var subject = new Subject
            {
                SubjectId = 1,
                SubjectName = "Lập trình Web",
                Course = "WEB101",
                NoCredits = 3,
                Description = "Môn học về lập trình web cơ bản"
            };
            _context.Subjects.Add(subject);

            // Tạo Teachers
            var teacherUser1 = new User
            {
                Id = Guid.NewGuid(),
                UserName = "teacher1@fpt.edu.vn",
                Email = "teacher1@fpt.edu.vn",
                Fullname = "Giáo viên 1",
                Code = "GV001",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                TwoFactorEnabled = false,
                LockoutEnabled = false,
                AccessFailedCount = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };
            _context.Users.Add(teacherUser1);

            var teacher1 = new Teacher
            {
                TeacherId = Guid.NewGuid(),
                UserId = teacherUser1.Id,
                User = teacherUser1,
                HireDate = DateTime.Now.AddYears(-2),
                IsHeadOfDepartment = false,
                IsExamManager = false,
                MajorId = 1
            };
            _context.Teachers.Add(teacher1);

            var teacherUser2 = new User
            {
                Id = Guid.NewGuid(),
                UserName = "teacher2@fpt.edu.vn",
                Email = "teacher2@fpt.edu.vn",
                Fullname = "Giáo viên 2",
                Code = "GV002",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                TwoFactorEnabled = false,
                LockoutEnabled = false,
                AccessFailedCount = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };
            _context.Users.Add(teacherUser2);

            var teacher2 = new Teacher
            {
                TeacherId = Guid.NewGuid(),
                UserId = teacherUser2.Id,
                User = teacherUser2,
                HireDate = DateTime.Now.AddYears(-1),
                IsHeadOfDepartment = false,
                IsExamManager = false,
                MajorId = 1
            };
            _context.Teachers.Add(teacher2);

            // Tạo SubjectTeacher
            var subjectTeacher1 = new SubjectTeacher
            {
                TeacherId = teacher1.TeacherId,
                SubjectId = 1,
                IsGradeTeacher = true,
                IsCreateExamTeacher = false,
                IsActiveSubjectTeacher = true
            };
            _context.SubjectTeachers.Add(subjectTeacher1);

            var subjectTeacher2 = new SubjectTeacher
            {
                TeacherId = teacher2.TeacherId,
                SubjectId = 1,
                IsGradeTeacher = false,
                IsCreateExamTeacher = true,
                IsActiveSubjectTeacher = true
            };
            _context.SubjectTeachers.Add(subjectTeacher2);

            _context.SaveChanges();
        }

        // ========== GET ALL TEACHER HAVE SUBJECT TEST CASES ==========

        [Test]
        public async Task GetAllTeacherHaveSubject_TestCase1_ValidSubjectId_ReturnsTeachers()
        {
            // Arrange: SubjectId hợp lệ (Test Case 1)
            var subjectId = 1;

            // Act: Lấy danh sách giáo viên có môn học
            var result = await _repository.GetAllTeacherHaveSubject(subjectId);

            // Assert: Trả về danh sách có dữ liệu
            result.Should().NotBeNull();
            result.Should().HaveCount(2); // Có 2 giáo viên dạy môn học này

            var teachers = result.ToList();
            teachers.Should().Contain(t => t.Fullname == "Giáo viên 1");
            teachers.Should().Contain(t => t.Fullname == "Giáo viên 2");
        }

        [Test]
        public async Task GetAllTeacherHaveSubject_TestCase2_InvalidSubjectId_ReturnsEmptyList()
        {
            // Arrange: SubjectId không hợp lệ (Test Case 2)
            var invalidSubjectId = 999; // SubjectId không tồn tại

            // Act: Lấy danh sách giáo viên có môn học
            var result = await _repository.GetAllTeacherHaveSubject(invalidSubjectId);

            // Assert: Trả về danh sách rỗng
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Test]
        public async Task GetAllTeacherHaveSubject_TestCase3_ValidSearch_ReturnsFilteredTeachers()
        {
            // Arrange: SubjectId hợp lệ + search text hợp lệ (Test Case 3)
            var subjectId = 1;
            var searchText = "Giáo viên 1";

            // Act: Lấy danh sách giáo viên có môn học với search
            var result = await _repository.GetAllTeacherHaveSubject(subjectId, searchText);

            // Assert: Trả về danh sách đã được lọc
            result.Should().NotBeNull();
            result.Should().HaveCount(1); // Chỉ có 1 giáo viên thỏa mãn search

            var teachers = result.ToList();
            teachers.Should().Contain(t => t.Fullname == "Giáo viên 1");
            teachers.Should().NotContain(t => t.Fullname == "Giáo viên 2");
        }

        [Test]
        public async Task GetAllTeacherHaveSubject_TestCase4_InvalidSearch_ReturnsEmptyList()
        {
            // Arrange: SubjectId hợp lệ + search text không tìm thấy (Test Case 4)
            var subjectId = 1;
            var searchText = "Giáo viên 999"; // Search text không tồn tại

            // Act: Lấy danh sách giáo viên có môn học với search
            var result = await _repository.GetAllTeacherHaveSubject(subjectId, searchText);

            // Assert: Trả về danh sách rỗng
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Test]
        public async Task GetAllTeacherHaveSubject_TestCase5_Pagination_ReturnsCorrectPage()
        {
            // Arrange: SubjectId hợp lệ + phân trang (Test Case 5)
            var subjectId = 1;
            var pageNumber = 1;
            var pageSize = 1;

            // Act: Lấy danh sách giáo viên có môn học với phân trang
            var result = await _repository.GetAllTeacherHaveSubject(subjectId, null, pageNumber, pageSize);

            // Assert: Trả về đúng số lượng theo phân trang
            result.Should().NotBeNull();
            result.Should().HaveCount(1); // Chỉ trả về 1 giáo viên theo pageSize
        }

        [Test]
        public async Task GetAllTeacherHaveSubject_TestCase6_NoTeachersForSubject_ReturnsEmptyList()
        {
            // Arrange: SubjectId hợp lệ nhưng không có giáo viên nào dạy môn học này (Test Case 6)
            var subjectId = 1;

            // Xóa tất cả SubjectTeacher để tạo trường hợp không có giáo viên
            _context.SubjectTeachers.RemoveRange(_context.SubjectTeachers);
            await _context.SaveChangesAsync();

            // Act: Lấy danh sách giáo viên có môn học
            var result = await _repository.GetAllTeacherHaveSubject(subjectId);

            // Assert: Trả về danh sách rỗng
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }
    }
} 