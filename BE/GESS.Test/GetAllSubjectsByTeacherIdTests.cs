using NUnit.Framework;
using Microsoft.EntityFrameworkCore;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Implement;
using GESS.Model.Subject;
using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;

namespace GESS.Test
{
    [TestFixture]
    public class GetAllSubjectsByTeacherIdTests
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
            // Tạo Major
            var major = new Major
            {
                MajorId = 1,
                MajorName = "Software Engineering",
                
            };
            _context.Majors.Add(major);

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

            // Tạo TrainingProgram
            var trainingProgram = new TrainingProgram
            {
                TrainProId = 1,
                TrainProName = "Chương trình đào tạo SE",
                MajorId = 1,
                StartDate = DateTime.Now.AddYears(-1),
                EndDate = DateTime.Now.AddYears(3),
             
            };
            _context.TrainingPrograms.Add(trainingProgram);

            // Tạo Subjects
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

            var subject3 = new Subject
            {
                SubjectId = 3,
                SubjectName = "Lập trình Java",
                Course = "JAVA101",
                NoCredits = 4,
                Description = "Môn học về lập trình Java"
            };
            _context.Subjects.Add(subject3);

            // Tạo SubjectTrainingProgram (liên kết Subject với TrainingProgram)
            var subjectTrainingProgram1 = new SubjectTrainingProgram
            {
                SubjectId = 1,
                TrainProId = 1
            };
            _context.SubjectTrainingPrograms.Add(subjectTrainingProgram1);

            var subjectTrainingProgram2 = new SubjectTrainingProgram
            {
                SubjectId = 2,
                TrainProId = 1
            };
            _context.SubjectTrainingPrograms.Add(subjectTrainingProgram2);

            var subjectTrainingProgram3 = new SubjectTrainingProgram
            {
                SubjectId = 3,
                TrainProId = 1
            };
            _context.SubjectTrainingPrograms.Add(subjectTrainingProgram3);

            _context.SaveChanges();
        }

        // ========== GET ALL SUBJECTS BY TEACHER ID TEST CASES ==========

        [Test]
        public async Task GetAllSubjectsByTeacherId_TestCase1_ValidTeacherId_ReturnsSubjects()
        {
            // Arrange: TeacherId hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;

            // Act: Lấy danh sách môn học
            var result = await _repository.GetAllSubjectsByTeacherId(teacherId);

            // Assert: Trả về danh sách có dữ liệu
            result.Should().NotBeNull();
            result.Should().HaveCount(3); // Có 3 môn học trong training program

            var subjects = result.ToList();
            subjects.Should().Contain(s => s.SubjectName == "Lập trình Web");
            subjects.Should().Contain(s => s.SubjectName == "Cơ sở dữ liệu");
            subjects.Should().Contain(s => s.SubjectName == "Lập trình Java");
        }

        [Test]
        public async Task GetAllSubjectsByTeacherId_TestCase2_InvalidTeacherId_ReturnsEmptyList()
        {
            // Arrange: TeacherId không hợp lệ
            var invalidTeacherId = Guid.NewGuid(); // TeacherId không tồn tại

            // Act: Lấy danh sách môn học
            var result = await _repository.GetAllSubjectsByTeacherId(invalidTeacherId);

            // Assert: Trả về danh sách rỗng vì không tìm thấy teacher
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Test]
        public async Task GetAllSubjectsByTeacherId_TestCase3_ValidSearch_ReturnsFilteredSubjects()
        {
            // Arrange: TeacherId hợp lệ và search text hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;
            var searchText = "Web"; // Tìm kiếm môn học có chứa "Web"

            // Act: Lấy danh sách môn học với search
            var result = await _repository.GetAllSubjectsByTeacherId(teacherId, searchText);

            // Assert: Trả về danh sách đã được lọc
            result.Should().NotBeNull();
            result.Should().HaveCount(1); // Chỉ có 1 môn học chứa "Web"

            var subjects = result.ToList();
            subjects.Should().Contain(s => s.SubjectName == "Lập trình Web");
            subjects.Should().NotContain(s => s.SubjectName == "Cơ sở dữ liệu");
            subjects.Should().NotContain(s => s.SubjectName == "Lập trình Java");
        }

        [Test]
        public async Task GetAllSubjectsByTeacherId_TestCase4_InvalidSearch_ReturnsEmptyList()
        {
            // Arrange: TeacherId hợp lệ nhưng search text không tìm thấy
            var teacherId = _context.Teachers.First().TeacherId;
            var searchText = "Python"; // Tìm kiếm môn học không tồn tại

            // Act: Lấy danh sách môn học với search
            var result = await _repository.GetAllSubjectsByTeacherId(teacherId, searchText);

            // Assert: Trả về danh sách rỗng vì không tìm thấy môn học nào
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Test]
        public async Task GetAllSubjectsByTeacherId_TestCase5_EmptyListReturn_ReturnsEmptyList()
        {
            // Arrange: TeacherId hợp lệ nhưng không có môn học nào trong training program
            var teacherId = _context.Teachers.First().TeacherId;

            // Xóa tất cả SubjectTrainingProgram để tạo trường hợp danh sách rỗng
            _context.SubjectTrainingPrograms.RemoveRange(_context.SubjectTrainingPrograms);
            await _context.SaveChangesAsync();

            // Act: Lấy danh sách môn học
            var result = await _repository.GetAllSubjectsByTeacherId(teacherId);

            // Assert: Trả về danh sách rỗng
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }
    }
} 