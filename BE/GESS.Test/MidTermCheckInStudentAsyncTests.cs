using NUnit.Framework;
using Microsoft.EntityFrameworkCore;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Implement;
using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;

namespace GESS.Test
{
    [TestFixture]
    public class MidTermCheckInStudentAsyncTests
    {
        private GessDbContext _context;
        private ExamScheduleRepository _repository;

        [SetUp]
        public void Setup()
        {
            // Khởi tạo In-Memory Database cho testing
            var options = new DbContextOptionsBuilder<GessDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new GessDbContext(options);

            // Khởi tạo repository
            _repository = new ExamScheduleRepository(_context);

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
            // Tạo Teacher
            var teacherUser = new User
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
            _context.Users.Add(teacherUser);

            var teacher = new Teacher
            {
                TeacherId = Guid.NewGuid(),
                UserId = teacherUser.Id,
                User = teacherUser,
                HireDate = DateTime.Now.AddYears(-2),
                IsHeadOfDepartment = false,
                IsExamManager = false,
                MajorId = 1
            };
            _context.Teachers.Add(teacher);

            // Tạo Student
            var studentUser = new User
            {
                Id = Guid.NewGuid(),
                UserName = "student1@fpt.edu.vn",
                Email = "student1@fpt.edu.vn",
                Fullname = "Sinh viên 1",
                Code = "SV001",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                TwoFactorEnabled = false,
                LockoutEnabled = false,
                AccessFailedCount = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };
            _context.Users.Add(studentUser);

                                      var student = new Student
             {
                 StudentId = Guid.NewGuid(),
                 UserId = studentUser.Id,
                 User = studentUser,

                 CohortId = 1,
                 AvatarURL = "https://example.com/avatar.jpg"
             };
            _context.Students.Add(student);

            // Tạo Major
            var major = new Major
            {
                MajorId = 1,
                MajorName = "Software Engineering"
            };
            _context.Majors.Add(major);

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

            // Tạo Semester
            var semester = new Semester
            {
                SemesterId = 1,
                SemesterName = "Học kỳ 1",
                IsActive = true
            };
            _context.Semesters.Add(semester);

            // Tạo CategoryExam
            var categoryExam = new CategoryExam
            {
                CategoryExamId = 1,
                CategoryExamName = "Giữa kỳ"
            };
            _context.CategoryExams.Add(categoryExam);

            // Tạo MultiExam (Multiple Choice Exam)
            var multiExam = new MultiExam
            {
                MultiExamId = 1,
                MultiExamName = "Kỳ thi giữa kỳ Web",
                SubjectId = 1,
                Duration = 60,
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(7).AddHours(1),
                CategoryExamId = 1, // Mid-term exam
                SemesterId = 1,
                TeacherId = teacher.TeacherId,
                CreateAt = DateTime.Now,
                ClassId = 1,
                Status = "Active"
            };
            _context.MultiExams.Add(multiExam);

            // Tạo PracticeExam
            var practiceExam = new PracticeExam
            {
                PracExamId = 1,
                PracExamName = "Kỳ thi thực hành giữa kỳ Web",
                SubjectId = 1,
                Duration = 90,
                StartDay = DateTime.Now.AddDays(14),
                EndDay = DateTime.Now.AddDays(14).AddHours(1.5),
                CategoryExamId = 1, // Mid-term exam
                SemesterId = 1,
                TeacherId = teacher.TeacherId,
                CreateAt = DateTime.Now,
                ClassId = 1,
                Status = "Active"
            };
            _context.PracticeExams.Add(practiceExam);

                                      // Tạo MultiExamHistory (chưa check-in)
             var multiExamHistory = new MultiExamHistory
             {

                 MultiExamId = 1,
                 StudentId = student.StudentId,
                 CheckIn = false,
                 StartTime = null,
                 EndTime = null,
                 Score = null
             };
            _context.MultiExamHistories.Add(multiExamHistory);

            // Tạo PracticeExamHistory (chưa check-in)
            var practiceExamHistory = new PracticeExamHistory
            {
                PracExamId = 1,
                StudentId = student.StudentId,
                CheckIn = false,
                StartTime = null,
                EndTime = null,
                Score = null
            };
            _context.PracticeExamHistories.Add(practiceExamHistory);

            _context.SaveChanges();
        }

        [Test]
        public async Task MidTermCheckInStudentAsync_TestCase1_ValidAllData_MultipleExam_ReturnsTrue()
        {
            // Arrange
            var validExamId = 1;
            var validStudentId = _context.Students.First().StudentId;
            var validExamType = 1; // Multiple choice exam

            // Act
            var result = await _repository.MidTermCheckInStudentAsync(validExamId, validStudentId, validExamType);

            // Assert
            result.Should().BeTrue();

            // Verify that the student is checked in
            var updatedHistory = await _context.MultiExamHistories
                .FirstAsync(h => h.MultiExamId == validExamId && h.StudentId == validStudentId);
            updatedHistory.CheckIn.Should().BeTrue();
        }

        [Test]
        public async Task MidTermCheckInStudentAsync_TestCase2_ValidAllData_PracticeExam_ReturnsTrue()
        {
            // Arrange
            var validExamId = 1;
            var validStudentId = _context.Students.First().StudentId;
            var validExamType = 2; // Practice exam

            // Act
            var result = await _repository.MidTermCheckInStudentAsync(validExamId, validStudentId, validExamType);

            // Assert
            result.Should().BeTrue();

            // Verify that the student is checked in
            var updatedHistory = await _context.PracticeExamHistories
                .FirstAsync(h => h.PracExamId == validExamId && h.StudentId == validStudentId);
            updatedHistory.CheckIn.Should().BeTrue();
        }

        [Test]
        public async Task MidTermCheckInStudentAsync_TestCase3_InvalidExamId_ReturnsFalse()
        {
            // Arrange
            var invalidExamId = 999; // Không tồn tại
            var validStudentId = _context.Students.First().StudentId;
            var validExamType = 1; // Multiple choice exam

            // Act
            var result = await _repository.MidTermCheckInStudentAsync(invalidExamId, validStudentId, validExamType);

            // Assert
            result.Should().BeFalse();
        }

        [Test]
        public async Task MidTermCheckInStudentAsync_TestCase4_InvalidStudentId_ReturnsFalse()
        {
            // Arrange
            var validExamId = 1;
            var invalidStudentId = Guid.NewGuid(); // Không tồn tại
            var validExamType = 1; // Multiple choice exam

            // Act
            var result = await _repository.MidTermCheckInStudentAsync(validExamId, invalidStudentId, validExamType);

            // Assert
            result.Should().BeFalse();
        }

        [Test]
        public async Task MidTermCheckInStudentAsync_TestCase5_InvalidExamType_ReturnsFalse()
        {
            // Arrange
            var validExamId = 1;
            var validStudentId = _context.Students.First().StudentId;
            var invalidExamType = 0; // Không hợp lệ

            // Act
            var result = await _repository.MidTermCheckInStudentAsync(validExamId, validStudentId, invalidExamType);

            // Assert
            result.Should().BeFalse();
        }

        [Test]
        public async Task MidTermCheckInStudentAsync_TestCase6_InvalidExamType3_ReturnsFalse()
        {
            // Arrange
            var validExamId = 1;
            var validStudentId = _context.Students.First().StudentId;
            var invalidExamType = 3; // Không hợp lệ

            // Act
            var result = await _repository.MidTermCheckInStudentAsync(validExamId, validStudentId, invalidExamType);

            // Assert
            result.Should().BeFalse();
        }

        [Test]
        public async Task MidTermCheckInStudentAsync_TestCase7_AlreadyCheckedIn_ReturnsTrue()
        {
            // Arrange: Check-in lần đầu
            var validExamId = 1;
            var validStudentId = _context.Students.First().StudentId;
            var validExamType = 1; // Multiple choice exam

            // Check-in lần đầu
            await _repository.MidTermCheckInStudentAsync(validExamId, validStudentId, validExamType);

            // Act: Check-in lần thứ hai
            var result = await _repository.MidTermCheckInStudentAsync(validExamId, validStudentId, validExamType);

            // Assert
            result.Should().BeTrue(); // Vẫn trả về true vì đã check-in thành công

            // Verify that the student is still checked in
            var updatedHistory = await _context.MultiExamHistories
                .FirstAsync(h => h.MultiExamId == validExamId && h.StudentId == validStudentId);
            updatedHistory.CheckIn.Should().BeTrue();
        }

        [Test]
        public async Task MidTermCheckInStudentAsync_TestCase8_NegativeExamId_ReturnsFalse()
        {
            // Arrange
            var invalidExamId = -1;
            var validStudentId = _context.Students.First().StudentId;
            var validExamType = 1; // Multiple choice exam

            // Act
            var result = await _repository.MidTermCheckInStudentAsync(invalidExamId, validStudentId, validExamType);

            // Assert
            result.Should().BeFalse();
        }

        [Test]
        public async Task MidTermCheckInStudentAsync_TestCase9_ZeroExamId_ReturnsFalse()
        {
            // Arrange
            var invalidExamId = 0;
            var validStudentId = _context.Students.First().StudentId;
            var validExamType = 1; // Multiple choice exam

            // Act
            var result = await _repository.MidTermCheckInStudentAsync(invalidExamId, validStudentId, validExamType);

            // Assert
            result.Should().BeFalse();
        }

        [Test]
        public async Task MidTermCheckInStudentAsync_TestCase10_EmptyStudentId_ReturnsFalse()
        {
            // Arrange
            var validExamId = 1;
            var invalidStudentId = Guid.Empty; // Empty GUID
            var validExamType = 1; // Multiple choice exam

            // Act
            var result = await _repository.MidTermCheckInStudentAsync(validExamId, invalidStudentId, validExamType);

            // Assert
            result.Should().BeFalse();
        }
    }
} 