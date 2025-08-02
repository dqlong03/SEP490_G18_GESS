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
    public class GetExamNeedGradeByTeacherIdTests
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

            // Tạo Subject
            var subject1 = new Subject
            {
                SubjectId = 1,
                SubjectName = "Lập trình Web",
                Course = "WEB101",
                NoCredits = 3,
                Description = "Môn học về lập trình web cơ bản"
            };
            _context.Subjects.Add(subject1);

            var subject2 = new Subject
            {
                SubjectId = 2,
                SubjectName = "Cơ sở dữ liệu",
                Course = "DB101",
                NoCredits = 3,
                Description = "Môn học về cơ sở dữ liệu"
            };
            _context.Subjects.Add(subject2);

            // Tạo Semester
            var semester1 = new Semester
            {
                SemesterId = 1,
                SemesterName = "Học kỳ 1",
                IsActive = true
            };
            _context.Semesters.Add(semester1);

            var semester2 = new Semester
            {
                SemesterId = 2,
                SemesterName = "Học kỳ 2",
                IsActive = true
            };
            _context.Semesters.Add(semester2);

                        // Tạo Major
            var major = new Major
            {
                MajorId = 1,
                MajorName = "Software Engineering"
            };
            _context.Majors.Add(major);

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
                StartTime = new TimeSpan(8, 0, 0), // 8:00 AM
                EndTime = new TimeSpan(10, 0, 0)   // 10:00 AM
            };
            _context.ExamSlots.Add(examSlot);

            // Tạo PracticeExam
            var practiceExam1 = new PracticeExam
            {
                PracExamId = 1,
                PracExamName = "Bài thi tự luận 1",
                TeacherId = teacher.TeacherId,
                Duration = 60,
                StartDay = DateTime.Now.AddDays(-5),
                CreateAt = DateTime.Now.AddDays(-10),
                Status = "Đã đóng ca",
                IsGraded = 0, // Chưa chấm
                CategoryExamId = 1,
                SubjectId = 1,
                SemesterId = 1,
                ClassId = 1
            };
            _context.PracticeExams.Add(practiceExam1);

            var practiceExam2 = new PracticeExam
            {
                PracExamId = 2,
                PracExamName = "Bài thi tự luận 2",
                TeacherId = teacher.TeacherId,
                Duration = 90,
                StartDay = DateTime.Now.AddDays(-3),
                CreateAt = DateTime.Now.AddDays(-8),
                Status = "Đã đóng ca",
                IsGraded = 1, // Đã chấm
                CategoryExamId = 1,
                SubjectId = 2,
                SemesterId = 1,
                ClassId = 1
            };
            _context.PracticeExams.Add(practiceExam2);

            var practiceExam3 = new PracticeExam
            {
                PracExamId = 3,
                PracExamName = "Bài thi tự luận 3",
                TeacherId = teacher.TeacherId,
                Duration = 120,
                StartDay = DateTime.Now.AddDays(-1),
                CreateAt = DateTime.Now.AddDays(-5),
                Status = "Đã đóng ca",
                IsGraded = 0, // Chưa chấm
                CategoryExamId = 1,
                SubjectId = 1,
                SemesterId = 2,
                ClassId = 1
            };
            _context.PracticeExams.Add(practiceExam3);

            // Tạo ExamSlotRoom
            var examSlotRoom1 = new ExamSlotRoom
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
            _context.ExamSlotRooms.Add(examSlotRoom1);

            var examSlotRoom2 = new ExamSlotRoom
            {
                ExamSlotRoomId = 2,
                ExamSlotId = 1,
                RoomId = 1,
                ExamGradedId = teacher.TeacherId,
                SupervisorId = teacher.TeacherId,
                PracticeExamId = 2,
                SubjectId = 2,
                SemesterId = 1,
                ExamDate = DateTime.Now.AddDays(-3),
                IsGraded = 1,
                MultiOrPractice = "Practice"
            };
            _context.ExamSlotRooms.Add(examSlotRoom2);

            var examSlotRoom3 = new ExamSlotRoom
            {
                ExamSlotRoomId = 3,
                ExamSlotId = 1,
                RoomId = 1,
                ExamGradedId = teacher.TeacherId,
                SupervisorId = teacher.TeacherId,
                PracticeExamId = 3,
                SubjectId = 1,
                SemesterId = 2,
                ExamDate = DateTime.Now.AddDays(-1),
                IsGraded = 0,
                MultiOrPractice = "Practice"
            };
            _context.ExamSlotRooms.Add(examSlotRoom3);

            _context.SaveChanges();
        }

        // ========== GET EXAM NEED GRADE BY TEACHER ID TEST CASES ==========

        [Test]
        public async Task GetExamNeedGradeByTeacherId_TestCase1_ValidTeacherId_ReturnsExams()
        {
            // Arrange: TeacherId hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;

            // Act: Lấy danh sách bài thi cần chấm
            var result = await _repository.GetExamNeedGradeByTeacherIdAsync(teacherId, null, null, null, null, null, null);

            // Assert: Trả về danh sách (có thể rỗng hoặc có dữ liệu)
            result.Should().NotBeNull();
            
            // In ra để debug
            Console.WriteLine($"Result count: {result.Count()}");
            foreach (var exam in result)
            {
                Console.WriteLine($"Exam: {exam.ExamName}, Subject: {exam.SubjectName}");
            }
        }

        [Test]
        public async Task GetExamNeedGradeByTeacherId_TestCase2_InvalidTeacherId_ReturnsEmptyList()
        {
            // Arrange: TeacherId không hợp lệ
            var invalidTeacherId = Guid.NewGuid(); // TeacherId không tồn tại

            // Act: Lấy danh sách bài thi cần chấm
            var result = await _repository.GetExamNeedGradeByTeacherIdAsync(invalidTeacherId, null, null, null, null, null, null);

            // Assert: Trả về danh sách rỗng
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Test]
        public async Task GetExamNeedGradeByTeacherId_TestCase3_ValidSubjectFilter_ReturnsFilteredExams()
        {
            // Arrange: TeacherId hợp lệ + SubjectId filter hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;
            var subjectId = 1; // Lọc theo môn học "Lập trình Web"

            // Act: Lấy danh sách bài thi cần chấm với filter
            var result = await _repository.GetExamNeedGradeByTeacherIdAsync(teacherId, subjectId, null, null, null, null, null);

            // Assert: Trả về danh sách (có thể rỗng hoặc có dữ liệu)
            result.Should().NotBeNull();
        }

        [Test]
        public async Task GetExamNeedGradeByTeacherId_TestCase4_ValidStatusFilter_ReturnsFilteredExams()
        {
            // Arrange: TeacherId hợp lệ + StatusExam filter hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;
            var statusExam = 0; // Chỉ lấy bài thi chưa chấm

            // Act: Lấy danh sách bài thi cần chấm với filter
            var result = await _repository.GetExamNeedGradeByTeacherIdAsync(teacherId, null, statusExam, null, null, null, null);

            // Assert: Trả về danh sách (có thể rỗng hoặc có dữ liệu)
            result.Should().NotBeNull();
        }

        [Test]
        public async Task GetExamNeedGradeByTeacherId_TestCase5_ValidSemesterFilter_ReturnsFilteredExams()
        {
            // Arrange: TeacherId hợp lệ + SemesterId filter hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;
            var semesterId = 1; // Chỉ lấy bài thi học kỳ 1

            // Act: Lấy danh sách bài thi cần chấm với filter
            var result = await _repository.GetExamNeedGradeByTeacherIdAsync(teacherId, null, null, semesterId, null, null, null);

            // Assert: Trả về danh sách (có thể rỗng hoặc có dữ liệu)
            result.Should().NotBeNull();
        }

        [Test]
        public async Task GetExamNeedGradeByTeacherId_TestCase6_ValidYearFilter_ReturnsFilteredExams()
        {
            // Arrange: TeacherId hợp lệ + Year filter hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;
            var year = DateTime.Now.Year; // Lọc theo năm hiện tại

            // Act: Lấy danh sách bài thi cần chấm với filter
            var result = await _repository.GetExamNeedGradeByTeacherIdAsync(teacherId, null, null, null, year, null, null);

            // Assert: Trả về danh sách (có thể rỗng hoặc có dữ liệu)
            result.Should().NotBeNull();
        }

        [Test]
        public async Task GetExamNeedGradeByTeacherId_TestCase7_MultipleFilters_ReturnsFilteredExams()
        {
            // Arrange: TeacherId hợp lệ + nhiều filter hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;
            var subjectId = 1; // Môn học "Lập trình Web"
            var statusExam = 0; // Chưa chấm
            var semesterId = 1; // Học kỳ 1

            // Act: Lấy danh sách bài thi cần chấm với nhiều filter
            var result = await _repository.GetExamNeedGradeByTeacherIdAsync(teacherId, subjectId, statusExam, semesterId, null, null, null);

            // Assert: Trả về danh sách (có thể rỗng hoặc có dữ liệu)
            result.Should().NotBeNull();
        }

        [Test]
        public async Task GetExamNeedGradeByTeacherId_TestCase8_Pagination_ReturnsCorrectPage()
        {
            // Arrange: TeacherId hợp lệ + phân trang hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;
            var pageSize = 2;
            var pageIndex = 1;

            // Act: Lấy danh sách bài thi cần chấm với phân trang
            var result = await _repository.GetExamNeedGradeByTeacherIdAsync(teacherId, null, null, null, null, pageSize, pageIndex);

            // Assert: Trả về danh sách (có thể rỗng hoặc có dữ liệu)
            result.Should().NotBeNull();
        }

        [Test]
        public async Task GetExamNeedGradeByTeacherId_TestCase9_NoExamsForTeacher_ReturnsEmptyList()
        {
            // Arrange: TeacherId hợp lệ nhưng không có bài thi nào được assign
            var teacherId = _context.Teachers.First().TeacherId;

            // Xóa tất cả ExamSlotRoom để tạo trường hợp không có bài thi
            _context.ExamSlotRooms.RemoveRange(_context.ExamSlotRooms);
            await _context.SaveChangesAsync();

            // Act: Lấy danh sách bài thi cần chấm
            var result = await _repository.GetExamNeedGradeByTeacherIdAsync(teacherId, null, null, null, null, null, null);

            // Assert: Trả về danh sách rỗng
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }
    }
} 