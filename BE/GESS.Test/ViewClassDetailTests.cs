using FluentAssertions;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Class;
using GESS.Repository.Implement;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GESS.Test
{
    [TestFixture]
    public class ViewClassDetailTests
    {
        private GessDbContext _context;
        private IClassRepository _classRepository;

        [SetUp]
        public void Setup()
        {
            var services = new ServiceCollection();
            services.AddDbContext<GessDbContext>(options =>
                options.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()));

            var serviceProvider = services.BuildServiceProvider();
            _context = serviceProvider.GetRequiredService<GessDbContext>();
            
            _classRepository = new ClassRepository(_context);

            SeedTestData();
        }

        private void SeedTestData()
        {
            // Tạo Teacher
            var teacher = new Teacher
            {
                TeacherId = Guid.NewGuid(),
                HireDate = DateTime.UtcNow,
                MajorId = 1
            };
            _context.Teachers.Add(teacher);

            // Tạo Major
            var major = new Major
            {
                MajorId = 1,
                MajorName = "Công nghệ thông tin",
                StartDate = DateTime.UtcNow,
                IsActive = true
            };
            _context.Majors.Add(major);

            // Tạo Subject
            var subject = new Subject
            {
                SubjectId = 1,
                SubjectName = "Lập trình C#",
                Description = "Môn học lập trình C#",
                Course = "CS101",
                NoCredits = 3
            };
            _context.Subjects.Add(subject);

            // Tạo Semester
            var semester = new Semester
            {
                SemesterId = 1,
                SemesterName = "Học kỳ 1 năm 2024",
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

            // Tạo Users
            var user1 = new User
            {
                Id = Guid.NewGuid(),
                Email = "student1@test.com",
                UserName = "student1@test.com",
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
            var user2 = new User
            {
                Id = Guid.NewGuid(),
                Email = "student2@test.com",
                UserName = "student2@test.com",
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
            _context.Users.AddRange(user1, user2);

            // Tạo Students
            var student1 = new Student
            {
                StudentId = Guid.NewGuid(),
                UserId = user1.Id,
                EnrollDate = DateTime.UtcNow,
                AvatarURL = "avatar1.jpg"
            };
            var student2 = new Student
            {
                StudentId = Guid.NewGuid(),
                UserId = user2.Id,
                EnrollDate = DateTime.UtcNow,
                AvatarURL = "avatar2.jpg"
            };
            _context.Students.AddRange(student1, student2);

            // Tạo Class
            var classEntity = new Class
            {
                ClassId = 1,
                ClassName = "Lớp CNTT1",
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                SubjectId = 1,
                Subject = subject,
                SemesterId = 1,
                Semester = semester,
                CreatedDate = DateTime.UtcNow
            };
            _context.Classes.Add(classEntity);

            // Tạo ClassStudents
            var classStudent1 = new ClassStudent
            {
                ClassId = 1,
                StudentId = student1.StudentId,
                Class = classEntity,
                Student = student1
            };
            var classStudent2 = new ClassStudent
            {
                ClassId = 1,
                StudentId = student2.StudentId,
                Class = classEntity,
                Student = student2
            };
            _context.ClassStudents.AddRange(classStudent1, classStudent2);

            // Tạo MultiExam
            var multiExam = new MultiExam
            {
                MultiExamId = 1,
                MultiExamName = "Bài thi trắc nghiệm giữa kỳ",
                SubjectId = 1,
                CategoryExamId = 1,
                CategoryExam = categoryExam,
                ClassId = 1,
                Class = classEntity,
                StartDay = DateTime.UtcNow.AddDays(7),
                EndDay = DateTime.UtcNow.AddDays(8),
                Duration = 60,
                NumberQuestion = 20,
                IsPublish = true,
                Status = "Chưa chấm"
            };
            _context.MultiExams.Add(multiExam);

            // Tạo PracticeExam
            var practiceExam = new PracticeExam
            {
                PracExamId = 1,
                PracExamName = "Bài thi tự luận giữa kỳ",
                SubjectId = 1,
                CategoryExamId = 1,
                CategoryExam = categoryExam,
                ClassId = 1,
                Class = classEntity,
                StartDay = DateTime.UtcNow.AddDays(14),
                EndDay = DateTime.UtcNow.AddDays(15),
                Duration = 120,
                Status = "Chưa chấm"
            };
            _context.PracticeExams.Add(practiceExam);

            _context.SaveChanges();
        }

        [Test]
        public async Task GetClassDetailAsync_ValidClassId_ReturnsClassDetail()
        {
            // Act
            var result = await _classRepository.GetClassDetailAsync(1);

            // Assert
            result.Should().NotBeNull();
            result.ClassId.Should().Be(1);
            result.ClassName.Should().Be("Lớp CNTT1");
            result.Students.Should().HaveCount(2);
            result.Exams.Should().HaveCount(2);
        }

        [Test]
        public async Task GetClassDetailAsync_InvalidClassId_ReturnsNull()
        {
            // Act
            var result = await _classRepository.GetClassDetailAsync(999);

            // Assert
            result.Should().BeNull();
        }

        [Test]
        public async Task GetClassDetailAsync_ClassWithStudents_ReturnsCorrectStudentCount()
        {
            // Act
            var result = await _classRepository.GetClassDetailAsync(1);

            // Assert
            result.Should().NotBeNull();
            result.Students.Should().HaveCount(2);
            result.Students.Should().Contain(s => s.FullName == "Sinh viên 1");
            result.Students.Should().Contain(s => s.FullName == "Sinh viên 2");
        }

        [Test]
        public async Task GetClassDetailAsync_ClassWithExams_ReturnsCorrectExamCount()
        {
            // Act
            var result = await _classRepository.GetClassDetailAsync(1);

            // Assert
            result.Should().NotBeNull();
            result.Exams.Should().HaveCount(2);
            result.Exams.Should().Contain(e => e.ExamName == "Bài thi trắc nghiệm giữa kỳ");
            result.Exams.Should().Contain(e => e.ExamName == "Bài thi tự luận giữa kỳ");
        }

        [Test]
        public async Task GetClassDetailAsync_ClassWithoutStudents_ReturnsEmptyStudentList()
        {
            // Arrange - Create class without students
            var emptyClass = new Class
            {
                ClassId = 2,
                ClassName = "Lớp trống",
                TeacherId = _context.Teachers.First().TeacherId,
                SubjectId = 1,
                SemesterId = 1,
                CreatedDate = DateTime.UtcNow
            };
            _context.Classes.Add(emptyClass);
            await _context.SaveChangesAsync();

            // Act
            var result = await _classRepository.GetClassDetailAsync(2);

            // Assert
            result.Should().NotBeNull();
            result.Students.Should().BeEmpty();
        }

        [Test]
        public async Task GetClassDetailAsync_ClassWithoutExams_ReturnsEmptyExamList()
        {
            // Arrange - Create class without exams
            var noExamClass = new Class
            {
                ClassId = 3,
                ClassName = "Lớp không có bài thi",
                TeacherId = _context.Teachers.First().TeacherId,
                SubjectId = 1,
                SemesterId = 1,
                CreatedDate = DateTime.UtcNow
            };
            _context.Classes.Add(noExamClass);
            await _context.SaveChangesAsync();

            // Act
            var result = await _classRepository.GetClassDetailAsync(3);

            // Assert
            result.Should().NotBeNull();
            result.Exams.Should().BeEmpty();
        }

        

        [Test]
        public async Task GetClassDetailAsync_ExamWithStatus_ReturnsCorrectStatus()
        {
            // Act
            var result = await _classRepository.GetClassDetailAsync(1);

            // Assert
            result.Should().NotBeNull();
            var multiExam = result.Exams.FirstOrDefault(e => e.ExamName == "Bài thi trắc nghiệm giữa kỳ");
            multiExam.Should().NotBeNull();
            multiExam.Status.Should().Be("Chưa chấm");

            var practiceExam = result.Exams.FirstOrDefault(e => e.ExamName == "Bài thi tự luận giữa kỳ");
            practiceExam.Should().NotBeNull();
            practiceExam.Status.Should().Be("Chưa chấm");
        }

        [Test]
        public async Task GetClassDetailAsync_ZeroClassId_ReturnsNull()
        {
            // Act
            var result = await _classRepository.GetClassDetailAsync(0);

            // Assert
            result.Should().BeNull();
        }

        

        [TearDown]
        public void TearDown()
        {
            _context?.Dispose();
        }
    }
} 