using FluentAssertions;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Class;
using GESS.Repository.Implement;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GESS.Test
{
    [TestFixture]
    public class ViewClassListTests
    {
        private GessDbContext _context;
        private ClassRepository _classRepository;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<GessDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new GessDbContext(options);
            _classRepository = new ClassRepository(_context);
            SeedTestData();
        }

        [TearDown]
        public void TearDown()
        {
            _context.Dispose();
        }

        private void SeedTestData()
        {
            // Tạo User cho Teacher
            var teacherUser = new User
            {
                Id = Guid.NewGuid(),
                UserName = "teacher1",
                Email = "teacher1@test.com",
                Fullname = "Giáo viên 1",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                TwoFactorEnabled = false,
                LockoutEnabled = true,
                AccessFailedCount = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };
            _context.Users.Add(teacherUser);

            // Tạo Teacher
            var teacher = new Teacher
            {
                TeacherId = Guid.NewGuid(),
                UserId = teacherUser.Id,
                User = teacherUser
            };
            _context.Teachers.Add(teacher);

            // Tạo User cho Student
            var studentUser = new User
            {
                Id = Guid.NewGuid(),
                UserName = "student1",
                Email = "student1@test.com",
                Fullname = "Sinh viên 1",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                TwoFactorEnabled = false,
                LockoutEnabled = true,
                AccessFailedCount = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };
            _context.Users.Add(studentUser);

            // Tạo Student
            var student = new Student
            {
                StudentId = Guid.NewGuid(),
                UserId = studentUser.Id,
                User = studentUser,
                AvatarURL = "avatar1.jpg"
            };
            _context.Students.Add(student);

            // Tạo Major
            var major = new Major
            {
                MajorId = 1,
                MajorName = "Công nghệ thông tin"
            };
            _context.Majors.Add(major);

            // Tạo Subject
            var subject = new Subject
            {
                SubjectId = 1,
                SubjectName = "Lập trình web",
                Description = "Môn học về lập trình web",
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

            // Tạo Class
            var class1 = new Class
            {
                ClassId = 1,
                ClassName = "Lớp CNTT1",
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                SubjectId = subject.SubjectId,
                Subject = subject,
                SemesterId = semester.SemesterId,
                Semester = semester,
                CreatedDate = DateTime.UtcNow
            };
            _context.Classes.Add(class1);

            var class2 = new Class
            {
                ClassId = 2,
                ClassName = "Lớp CNTT2",
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                SubjectId = subject.SubjectId,
                Subject = subject,
                SemesterId = semester.SemesterId,
                Semester = semester,
                CreatedDate = DateTime.UtcNow
            };
            _context.Classes.Add(class2);

            // Tạo ClassStudent
            var classStudent = new ClassStudent
            {
                ClassId = 1,
                Class = class1,
                StudentId = student.StudentId,
                Student = student
            };
            _context.ClassStudents.Add(classStudent);

            _context.SaveChanges();
        }

        [Test]
        public async Task GetAllClassAsync_ValidRequest_ReturnsClassList()
        {
            // Arrange
            var name = "";
            var subjectId = (int?)null;
            var semesterId = (int?)null;
            var pageNumber = 1;
            var pageSize = 5;

            // Act
            var result = await _classRepository.GetAllClassAsync(name, subjectId, semesterId, pageNumber, pageSize);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            
            var classList = result.ToList();
            classList[0].ClassId.Should().Be(2); // OrderByDescending nên class2 sẽ đứng đầu
            classList[0].ClassName.Should().Be("Lớp CNTT2");
            classList[0].SubjectName.Should().Be("Lập trình web");
            classList[0].SemesterName.Should().Be("Học kỳ 1 năm 2024");
            classList[0].StudentCount.Should().Be(0); // Class2 không có student
        }

        [Test]
        public async Task GetAllClassAsync_WithSearchName_ReturnsFilteredResults()
        {
            // Arrange
            var name = "CNTT1";
            var subjectId = (int?)null;
            var semesterId = (int?)null;
            var pageNumber = 1;
            var pageSize = 5;

            // Act
            var result = await _classRepository.GetAllClassAsync(name, subjectId, semesterId, pageNumber, pageSize);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            
            var classItem = result.First();
            classItem.ClassName.Should().Be("Lớp CNTT1");
            classItem.StudentCount.Should().Be(1); // Có 1 student
        }

        [Test]
        public async Task GetAllClassAsync_WithSubjectFilter_ReturnsFilteredResults()
        {
            // Arrange
            var name = "";
            var subjectId = 1;
            var semesterId = (int?)null;
            var pageNumber = 1;
            var pageSize = 5;

            // Act
            var result = await _classRepository.GetAllClassAsync(name, subjectId, semesterId, pageNumber, pageSize);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            
            foreach (var classItem in result)
            {
                classItem.SubjectName.Should().Be("Lập trình web");
            }
        }

        [Test]
        public async Task GetAllClassAsync_WithPagination_ReturnsCorrectPage()
        {
            // Arrange
            var name = "";
            var subjectId = (int?)null;
            var semesterId = (int?)null;
            var pageNumber = 1;
            var pageSize = 1; // Chỉ lấy 1 item

            // Act
            var result = await _classRepository.GetAllClassAsync(name, subjectId, semesterId, pageNumber, pageSize);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            
            var classItem = result.First();
            classItem.ClassId.Should().Be(2); // Class2 (OrderByDescending)
        }

        [Test]
        public async Task GetAllClassByTeacherIdAsync_ValidTeacherId_ReturnsTeacherClasses()
        {
            // Arrange
            var teacherId = _context.Teachers.First().TeacherId;
            var name = "";
            var subjectId = (int?)null;
            var semesterId = (int?)null;
            var pageNumber = 1;
            var pageSize = 5;

            // Act
            var result = await _classRepository.GetAllClassByTeacherIdAsync(teacherId, name, subjectId, semesterId, pageNumber, pageSize);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            
            foreach (var classItem in result)
            {
                // Tất cả class đều thuộc về teacher này
                var classEntity = _context.Classes.First(c => c.ClassId == classItem.ClassId);
                classEntity.TeacherId.Should().Be(teacherId);
            }
        }

        [Test]
        public async Task GetAllClassByTeacherIdAsync_InvalidTeacherId_ReturnsEmptyList()
        {
            // Arrange
            var invalidTeacherId = Guid.NewGuid();
            var name = "";
            var subjectId = (int?)null;
            var semesterId = (int?)null;
            var pageNumber = 1;
            var pageSize = 5;

            // Act
            var result = await _classRepository.GetAllClassByTeacherIdAsync(invalidTeacherId, name, subjectId, semesterId, pageNumber, pageSize);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(0);
        }

        [Test]
        public async Task CountPageAsync_ValidRequest_ReturnsCorrectPageCount()
        {
            // Arrange
            var name = "";
            var subjectId = (int?)null;
            var semesterId = (int?)null;
            var pageSize = 1; // 1 item per page

            // Act
            var result = await _classRepository.CountPageAsync(name, subjectId, semesterId, pageSize);

            // Assert
            result.Should().Be(2); // 2 classes / 1 per page = 2 pages
        }

        [Test]
        public async Task CountPageByTeacherAsync_ValidTeacherId_ReturnsCorrectPageCount()
        {
            // Arrange
            var teacherId = _context.Teachers.First().TeacherId;
            var name = "";
            var subjectId = (int?)null;
            var semesterId = (int?)null;
            var pageSize = 1; // 1 item per page

            // Act
            var result = await _classRepository.CountPageByTeacherAsync(teacherId, name, subjectId, semesterId, pageSize);

            // Assert
            result.Should().Be(2); // 2 classes của teacher / 1 per page = 2 pages
        }

        [Test]
        public async Task GetStudentsByClassIdAsync_ValidClassId_ReturnsStudents()
        {
            // Arrange
            var classId = 1;

            // Act
            var result = await _classRepository.GetStudentsByClassIdAsync(classId);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            
            var student = result.First();
            student.FullName.Should().Be("Sinh viên 1");
            student.AvatarURL.Should().Be("avatar1.jpg");
        }

        [Test]
        public async Task GetStudentsByClassIdAsync_InvalidClassId_ReturnsEmptyList()
        {
            // Arrange
            var invalidClassId = 999;

            // Act
            var result = await _classRepository.GetStudentsByClassIdAsync(invalidClassId);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(0);
        }

        [Test]
        public async Task CountStudentsInClassAsync_ValidClassId_ReturnsCorrectCount()
        {
            // Arrange
            var classId = 1;

            // Act
            var result = await _classRepository.CountStudentsInClassAsync(classId);

            // Assert
            result.Should().Be(1); // Class1 có 1 student
        }

        [Test]
        public async Task CountStudentsInClassAsync_InvalidClassId_ReturnsZero()
        {
            // Arrange
            var invalidClassId = 999;

            // Act
            var result = await _classRepository.CountStudentsInClassAsync(invalidClassId);

            // Assert
            result.Should().Be(0);
        }

        [Test]
        public async Task CheckIfStudentInClassAsync_StudentInClass_ReturnsTrue()
        {
            // Arrange
            var classId = 1;
            var studentId = _context.Students.First().StudentId;

            // Act
            var result = await _classRepository.CheckIfStudentInClassAsync(classId, studentId);

            // Assert
            result.Should().BeTrue();
        }

        [Test]
        public async Task CheckIfStudentInClassAsync_StudentNotInClass_ReturnsFalse()
        {
            // Arrange
            var classId = 2; // Class2 không có student
            var studentId = _context.Students.First().StudentId;

            // Act
            var result = await _classRepository.CheckIfStudentInClassAsync(classId, studentId);

            // Assert
            result.Should().BeFalse();
        }
    }
} 