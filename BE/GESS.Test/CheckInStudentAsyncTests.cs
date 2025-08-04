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
    public class CheckInStudentAsyncTests
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

            // Tạo Class
            var class1 = new Class
            {
                ClassId = 1,
                ClassName = "SE1601",
                TeacherId = teacher.TeacherId,
                SubjectId = 1,
                SemesterId = 1,
                CreatedDate = DateTime.Now
            };
            _context.Classes.Add(class1);

            // Tạo CategoryExam
            var categoryExam = new CategoryExam
            {
                CategoryExamId = 1,
                CategoryExamName = "Thi cuối kỳ",
 
            };
            _context.CategoryExams.Add(categoryExam);

            // Tạo Room
            var room = new Room
            {
                RoomId = 1,
                RoomName = "A101",
                Description = "Phòng thi A101",
                Status = "Available",
                Capacity = 50
            };
            _context.Rooms.Add(room);

            // Tạo ExamSlot
            var examSlot = new ExamSlot
            {
                ExamSlotId = 1,
                SlotName = "Ca 1",
                StartTime = new TimeSpan(8, 0, 0),
                EndTime = new TimeSpan(10, 0, 0)
            };
            _context.ExamSlots.Add(examSlot);

            // Tạo PracticeExam
            var practiceExam = new PracticeExam
            {
                PracExamId = 1,
                PracExamName = "Bài thi tự luận 1",
                TeacherId = teacher.TeacherId,
                Duration = 60,
                StartDay = DateTime.Now.AddDays(-5),
                CreateAt = DateTime.Now.AddDays(-10),
                Status = "Đã đóng ca",
                IsGraded = 0,
                CategoryExamId = 1,
                SubjectId = 1,
                SemesterId = 1,
                ClassId = 1
            };
            _context.PracticeExams.Add(practiceExam);

            // Tạo ExamSlotRoom
            var examSlotRoom = new ExamSlotRoom
            {
                ExamSlotRoomId = 1,
                ExamSlotId = 1,
                RoomId = 1,
                ExamGradedId = teacher.TeacherId,
                SupervisorId = teacher.TeacherId,
                PracticeExamId = 1,
                SubjectId = 1,
                SemesterId = 1,
                ExamDate = DateTime.Now.AddDays(-5),
                IsGraded = 0,
                MultiOrPractice = "Practice"
            };
            _context.ExamSlotRooms.Add(examSlotRoom);

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
                AvatarURL = "avatar1.jpg"
            };
            _context.Students.Add(student);

            // Tạo StudentExamSlotRoom
            var studentExamSlotRoom = new StudentExamSlotRoom
            {
                StudentId = student.StudentId,
                ExamSlotRoomId = 1,
                Student = student,
                ExamSlotRoom = examSlotRoom
            };
            _context.StudentExamSlotRoom.Add(studentExamSlotRoom);

            // Tạo PracticeExamHistory
            var practiceExamHistory = new PracticeExamHistory
            {
                PracExamHistoryId = Guid.NewGuid(),
                PracExamId = 1,
                StudentId = student.StudentId,
                Student = student,
                PracticeExam = practiceExam,
                ExamSlotRoomId = 1,
                ExamSlotRoom = examSlotRoom,
                IsGraded = false,
                StatusExam = "Chưa chấm",
                Score = null,
                CheckIn = false
            };
            _context.PracticeExamHistories.Add(practiceExamHistory);

            _context.SaveChanges();
        }

        // ========== CHECK IN STUDENT ASYNC TEST CASES ==========

        [Test]
        public async Task CheckInStudentAsync_TestCase1_ValidAllData_ReturnsTrue()
        {
            // Arrange: ExamSlotId và StudentId hợp lệ
            var examSlotId = 1;
            var studentId = _context.Students.First().StudentId;

            // Act: Check-in sinh viên
            var result = await _repository.CheckInStudentAsync(examSlotId, studentId);

            // Assert: Trả về true và CheckIn được cập nhật
            result.Should().BeTrue();
            
            // Kiểm tra CheckIn đã được cập nhật
            var updatedHistory = await _context.PracticeExamHistories
                .FirstOrDefaultAsync(h => h.StudentId == studentId && h.PracExamId == 1);
            updatedHistory.Should().NotBeNull();
            updatedHistory.CheckIn.Should().BeTrue();
        }

        [Test]
        public async Task CheckInStudentAsync_TestCase2_InvalidExamSlotId_ReturnsFalse()
        {
            // Arrange: ExamSlotId không hợp lệ
            var invalidExamSlotId = 999; // ExamSlotId không tồn tại
            var studentId = _context.Students.First().StudentId;

            // Act: Check-in sinh viên
            var result = await _repository.CheckInStudentAsync(invalidExamSlotId, studentId);

            // Assert: Trả về false
            result.Should().BeFalse();
        }

        [Test]
        public async Task CheckInStudentAsync_TestCase3_InvalidStudentId_ReturnsFalse()
        {
            // Arrange: StudentId không hợp lệ
            var examSlotId = 1;
            var invalidStudentId = Guid.NewGuid(); // StudentId không tồn tại

            // Act: Check-in sinh viên
            var result = await _repository.CheckInStudentAsync(examSlotId, invalidStudentId);

            // Assert: Trả về false
            result.Should().BeFalse();
        }
    }
} 