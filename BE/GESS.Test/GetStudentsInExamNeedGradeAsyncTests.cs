using NUnit.Framework;
using Microsoft.EntityFrameworkCore;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Implement;
using GESS.Model.GradeSchedule;
using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;

namespace GESS.Test
{
    [TestFixture]
    public class GetStudentsInExamNeedGradeAsyncTests
    {
        private GessDbContext _context;
        private GradeScheduleRepository _repository;

        [SetUp]
        public void Setup()
        {
            // Khởi tạo In-Memory Database cho testing
            var options = new DbContextOptionsBuilder<GessDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new GessDbContext(options);

            // Khởi tạo repository
            _repository = new GradeScheduleRepository(_context);

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

            // Tạo Students
            var studentUser1 = new User
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
            _context.Users.Add(studentUser1);

            var student1 = new Student
            {
                StudentId = Guid.NewGuid(),
                UserId = studentUser1.Id,
                User = studentUser1,
                AvatarURL = "avatar1.jpg"
            };
            _context.Students.Add(student1);

            var studentUser2 = new User
            {
                Id = Guid.NewGuid(),
                UserName = "student2@fpt.edu.vn",
                Email = "student2@fpt.edu.vn",
                Fullname = "Sinh viên 2",
                Code = "SV002",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                TwoFactorEnabled = false,
                LockoutEnabled = false,
                AccessFailedCount = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };
            _context.Users.Add(studentUser2);

            var student2 = new Student
            {
                StudentId = Guid.NewGuid(),
                UserId = studentUser2.Id,
                User = studentUser2,
                AvatarURL = "avatar2.jpg"
            };
            _context.Students.Add(student2);

            // Tạo StudentExamSlotRoom
            var studentExamSlotRoom1 = new StudentExamSlotRoom
            {
                StudentId = student1.StudentId,
                ExamSlotRoomId = 1,
                Student = student1,
                ExamSlotRoom = examSlotRoom
            };
            _context.StudentExamSlotRoom.Add(studentExamSlotRoom1);

            var studentExamSlotRoom2 = new StudentExamSlotRoom
            {
                StudentId = student2.StudentId,
                ExamSlotRoomId = 1,
                Student = student2,
                ExamSlotRoom = examSlotRoom
            };
            _context.StudentExamSlotRoom.Add(studentExamSlotRoom2);

            // Tạo PracticeExamHistory
            var practiceExamHistory1 = new PracticeExamHistory
            {
                PracExamHistoryId = Guid.NewGuid(),
                PracExamId = 1,
                StudentId = student1.StudentId,
                Student = student1,
                PracticeExam = practiceExam,
                ExamSlotRoomId = 1,
                ExamSlotRoom = examSlotRoom,
                IsGraded = false,
                StatusExam = "Chưa chấm",
                Score = null
            };
            _context.PracticeExamHistories.Add(practiceExamHistory1);

            var practiceExamHistory2 = new PracticeExamHistory
            {
                PracExamHistoryId = Guid.NewGuid(),
                PracExamId = 1,
                StudentId = student2.StudentId,
                Student = student2,
                PracticeExam = practiceExam,
                ExamSlotRoomId = 1,
                ExamSlotRoom = examSlotRoom,
                IsGraded = true,
                StatusExam = "Đã chấm",
                Score = 8.5
            };
            _context.PracticeExamHistories.Add(practiceExamHistory2);

            _context.SaveChanges();
        }

        // ========== GET STUDENTS IN EXAM NEED GRADE ASYNC TEST CASES ==========

        [Test]
        public async Task GetStudentsInExamNeedGradeAsync_TestCase1_ValidAllData_ReturnsStudents()
        {
            // Arrange: TeacherId và ExamId hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;
            var examId = 1; // PracExamId = 1

            // Act: Lấy danh sách sinh viên trong bài thi
            var result = await _repository.GetStudentsInExamNeedGradeAsync(teacherId, examId);

            // Assert: Trả về danh sách sinh viên
            result.Should().NotBeNull();
            result.Should().HaveCount(2); // Có 2 sinh viên trong bài thi

            var students = result.ToList();
            students.Should().Contain(s => s.Code == "SV001");
            students.Should().Contain(s => s.Code == "SV002");
        }

        [Test]
        public async Task GetStudentsInExamNeedGradeAsync_TestCase2_InvalidTeacherId_ReturnsEmptyList()
        {
            // Arrange: TeacherId không hợp lệ
            var invalidTeacherId = Guid.NewGuid(); // TeacherId không tồn tại
            var examId = 1;

            // Act: Lấy danh sách sinh viên trong bài thi
            var result = await _repository.GetStudentsInExamNeedGradeAsync(invalidTeacherId, examId);

            // Assert: Trả về danh sách rỗng
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Test]
        public async Task GetStudentsInExamNeedGradeAsync_TestCase3_InvalidExamId_ReturnsEmptyList()
        {
            // Arrange: ExamId không hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;
            var invalidExamId = 999; // ExamId không tồn tại

            // Act: Lấy danh sách sinh viên trong bài thi
            var result = await _repository.GetStudentsInExamNeedGradeAsync(teacherId, invalidExamId);

            // Assert: Trả về danh sách rỗng
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }
    }
} 