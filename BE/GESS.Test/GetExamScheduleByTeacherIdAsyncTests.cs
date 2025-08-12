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
    public class GetExamScheduleByTeacherIdAsyncTests
    {
        private GessDbContext _context;
        private ExamScheduleRepository _repository;

        private Guid _teacherId1;
        private Guid _teacherId2;

        private int _subjectId;
        private int _roomId;
        private int _examSlotId;
        private int _semesterId;
        private int _categoryExamId;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<GessDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new GessDbContext(options);
            _repository = new ExamScheduleRepository(_context);

            SeedBaseData();
        }

        [TearDown]
        public void TearDown()
        {
            _context?.Dispose();
        }

        private void SeedBaseData()
        {
            // Major
            var major = new Major { MajorId = 1, MajorName = "Software Engineering" };
            _context.Majors.Add(major);

            // Semester & CategoryExam
            var semester = new Semester { SemesterId = 1, SemesterName = "2024A", IsActive = true };
            _context.Semesters.Add(semester);
            _semesterId = semester.SemesterId;

            var category = new CategoryExam { CategoryExamId = 1, CategoryExamName = "Giữa kỳ" };
            _context.CategoryExams.Add(category);
            _categoryExamId = category.CategoryExamId;

            // Users + Teachers
            var tUser1 = new User { Id = Guid.NewGuid(), UserName = "teacher1", Email = "teacher1@fpt.edu.vn", Fullname = "GV 1", IsActive = true };
            var tUser2 = new User { Id = Guid.NewGuid(), UserName = "teacher2", Email = "teacher2@fpt.edu.vn", Fullname = "GV 2", IsActive = true };
            _context.Users.AddRange(tUser1, tUser2);

            var teacher1 = new Teacher { TeacherId = Guid.NewGuid(), UserId = tUser1.Id, User = tUser1, MajorId = major.MajorId, HireDate = DateTime.Now.AddYears(-3) };
            var teacher2 = new Teacher { TeacherId = Guid.NewGuid(), UserId = tUser2.Id, User = tUser2, MajorId = major.MajorId, HireDate = DateTime.Now.AddYears(-2) };
            _context.Teachers.AddRange(teacher1, teacher2);
            _teacherId1 = teacher1.TeacherId;
            _teacherId2 = teacher2.TeacherId;

            // Subject, Room, ExamSlot
            var subject = new Subject
            {
                SubjectId = 1,
                SubjectName = "Lập trình Web",
                Course = "WEB101",
                NoCredits = 3,
                Description = "Môn học về lập trình web cơ bản"
            };
            _context.Subjects.Add(subject);
            _subjectId = subject.SubjectId;

            var room = new Room
            {
                RoomId = 1,
                RoomName = "A101",
                Capacity = 40,
                Status = "Available",
                Description = "Phòng thi A101"
            };
            _context.Rooms.Add(room);
            _roomId = room.RoomId;

            var examSlot = new ExamSlot { ExamSlotId = 1, SlotName = "Ca 1", StartTime = new TimeSpan(8, 0, 0), EndTime = new TimeSpan(10, 0, 0) };
            _context.ExamSlots.Add(examSlot);
            _examSlotId = examSlot.ExamSlotId;

            _context.SaveChanges();
        }

        private int AddMultipleExamWithSlotRoom(DateTime startDay, Guid supervisorId)
        {
            var multiExam = new MultiExam
            {
                MultiExamName = "Thi trắc nghiệm",
                SubjectId = _subjectId,
                SemesterId = _semesterId,
                CategoryExamId = _categoryExamId,
                Duration = 60,
                StartDay = startDay,
                EndDay = startDay.AddHours(2),
                TeacherId = supervisorId,
                Status = "Active"
            };
            _context.MultiExams.Add(multiExam);
            _context.SaveChanges();

            var esr = new ExamSlotRoom
            {
                ExamSlotId = _examSlotId,
                RoomId = _roomId,
                SupervisorId = supervisorId,
                SubjectId = _subjectId,
                SemesterId = _semesterId,
                MultiExamId = multiExam.MultiExamId,
                MultiOrPractice = "Multiple",
                ExamDate = startDay.Date
            };
            _context.ExamSlotRooms.Add(esr);
            _context.SaveChanges();
            return esr.ExamSlotRoomId;
        }

        private int AddPracticeExamWithSlotRoom(DateTime startDay, Guid supervisorId)
        {
            var pracExam = new PracticeExam
            {
                PracExamName = "Thi tự luận",
                SubjectId = _subjectId,
                SemesterId = _semesterId,
                CategoryExamId = _categoryExamId,
                Duration = 90,
                StartDay = startDay,
                EndDay = startDay.AddHours(2),
                TeacherId = supervisorId,
                Status = "Active"
            };
            _context.PracticeExams.Add(pracExam);
            _context.SaveChanges();

            var esr = new ExamSlotRoom
            {
                ExamSlotId = _examSlotId,
                RoomId = _roomId,
                SupervisorId = supervisorId,
                SubjectId = _subjectId,
                SemesterId = _semesterId,
                PracticeExamId = pracExam.PracExamId,
                MultiOrPractice = "Practice",
                ExamDate = startDay.Date
            };
            _context.ExamSlotRooms.Add(esr);
            _context.SaveChanges();
            return esr.ExamSlotRoomId;
        }

        [Test]
        public async Task GetExamScheduleByTeacherIdAsync_ReturnsBothMultipleAndPracticeWithinRange()
        {
            // Arrange
            var fromDate = new DateTime(2025, 1, 1);
            var toDate = new DateTime(2025, 1, 31);

            AddMultipleExamWithSlotRoom(new DateTime(2025, 1, 10), _teacherId1); // in range
            AddPracticeExamWithSlotRoom(new DateTime(2025, 1, 20), _teacherId1); // in range

            // out of scope distractions
            AddMultipleExamWithSlotRoom(new DateTime(2024, 12, 31), _teacherId1); // before range
            AddPracticeExamWithSlotRoom(new DateTime(2025, 2, 1), _teacherId1);   // after range
            AddMultipleExamWithSlotRoom(new DateTime(2025, 1, 15), _teacherId2);  // other teacher

            // Act
            var result = await _repository.GetExamScheduleByTeacherIdAsync(_teacherId1, fromDate, toDate);

            // Assert
            result.Should().NotBeNull();
            result.Count().Should().Be(2);
            result.All(e => e.SupervisorId == _teacherId1).Should().BeTrue();
            result.Select(e => e.MultiOrPractice).Should().BeEquivalentTo(new[] { "Multiple", "Practice" });
        }

        [Test]
        public async Task GetExamScheduleByTeacherIdAsync_IncludesBoundaryDates()
        {
            // Arrange
            var fromDate = new DateTime(2025, 3, 1);
            var toDate = new DateTime(2025, 3, 31);

            AddMultipleExamWithSlotRoom(new DateTime(2025, 3, 1), _teacherId1);  // exactly from
            AddPracticeExamWithSlotRoom(new DateTime(2025, 3, 31), _teacherId1); // exactly to

            // Act
            var result = await _repository.GetExamScheduleByTeacherIdAsync(_teacherId1, fromDate, toDate);

            // Assert
            result.Should().NotBeNull();
            result.Count().Should().Be(2);
        }

        [Test]
        public async Task GetExamScheduleByTeacherIdAsync_FiltersByTeacher()
        {
            // Arrange
            var fromDate = new DateTime(2025, 5, 1);
            var toDate = new DateTime(2025, 5, 31);

            AddMultipleExamWithSlotRoom(new DateTime(2025, 5, 10), _teacherId2); // other teacher

            // Act
            var result = await _repository.GetExamScheduleByTeacherIdAsync(_teacherId1, fromDate, toDate);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Test]
        public async Task GetExamScheduleByTeacherIdAsync_FiltersOutOfRangeDates()
        {
            // Arrange
            var fromDate = new DateTime(2025, 6, 1);
            var toDate = new DateTime(2025, 6, 30);

            AddMultipleExamWithSlotRoom(new DateTime(2025, 5, 31), _teacherId1); // before range
            AddPracticeExamWithSlotRoom(new DateTime(2025, 7, 1), _teacherId1);  // after range

            // Act
            var result = await _repository.GetExamScheduleByTeacherIdAsync(_teacherId1, fromDate, toDate);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Test]
        public async Task GetExamScheduleByTeacherIdAsync_WhenNoData_ReturnsEmptyList()
        {
            // Arrange
            var fromDate = new DateTime(2025, 8, 1);
            var toDate = new DateTime(2025, 8, 31);

            // Act
            var result = await _repository.GetExamScheduleByTeacherIdAsync(_teacherId1, fromDate, toDate);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Test]
        public async Task GetExamScheduleByTeacherIdAsync_TeacherIdEmpty_ReturnsEmpty()
        {
            // Arrange
            var fromDate = new DateTime(2025, 9, 1);
            var toDate = new DateTime(2025, 9, 30);
            AddMultipleExamWithSlotRoom(new DateTime(2025, 9, 10), _teacherId1); // has data for real teacher

            // Act
            var result = await _repository.GetExamScheduleByTeacherIdAsync(Guid.Empty, fromDate, toDate);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Test]
        public async Task GetExamScheduleByTeacherIdAsync_FromDateDefault_IncludesUpToToDate()
        {
            // Arrange
            var toDate = new DateTime(2025, 10, 15);
            var fromDate = default(DateTime); // giả lập từ ngày null

            AddMultipleExamWithSlotRoom(new DateTime(2025, 10, 1), _teacherId1);  // <= toDate → được lấy
            AddPracticeExamWithSlotRoom(new DateTime(2025, 10, 20), _teacherId1); // > toDate → bị loại

            // Act
            var result = await _repository.GetExamScheduleByTeacherIdAsync(_teacherId1, fromDate, toDate);

            // Assert
            result.Should().NotBeNull();
            result.Count().Should().Be(1);
            result.First().ExamDate.Should().Be(new DateTime(2025, 10, 1));
        }

        [Test]
        public async Task GetExamScheduleByTeacherIdAsync_ToDateDefault_ReturnsEmpty()
        {
            // Arrange
            var fromDate = new DateTime(2025, 11, 1);
            var toDate = default(DateTime); // giả lập đến ngày null

            AddMultipleExamWithSlotRoom(new DateTime(2025, 11, 5), _teacherId1);

            // Act
            var result = await _repository.GetExamScheduleByTeacherIdAsync(_teacherId1, fromDate, toDate);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }
    }
}


