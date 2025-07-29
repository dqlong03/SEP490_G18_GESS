using FluentAssertions;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Class;
using GESS.Service;
using Gess.Repository.Infrastructures;
using GESS.Repository.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GESS.Test
{
    [TestFixture]
    public class CreateClassServiceTests
    {
        private GessDbContext _context;
        private ClassService _classService;
        private Mock<IUnitOfWork> _mockUnitOfWork;
        private Mock<UserManager<User>> _mockUserManager;
        private Mock<RoleManager<IdentityRole<Guid>>> _mockRoleManager;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<GessDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            _context = new GessDbContext(options);
            SeedTestData();

            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockUserManager = new Mock<UserManager<User>>(
                Mock.Of<IUserStore<User>>(), null, null, null, null, null, null, null, null);
            _mockRoleManager = new Mock<RoleManager<IdentityRole<Guid>>>(
                Mock.Of<IRoleStore<IdentityRole<Guid>>>(), null, null, null, null);

            _mockUnitOfWork.Setup(uow => uow.DataContext).Returns(_context);
            _mockUnitOfWork.Setup(uow => uow.UserManager).Returns(_mockUserManager.Object);
            _mockUnitOfWork.Setup(uow => uow.RoleManager).Returns(_mockRoleManager.Object);

            // Mock ClassRepository
            var mockClassRepository = new Mock<IClassRepository>();
            _mockUnitOfWork.Setup(uow => uow.ClassRepository).Returns(mockClassRepository.Object);

            // Mock UserRepository
            var mockUserRepository = new Mock<IUserRepository>();
            _mockUnitOfWork.Setup(uow => uow.UserRepository).Returns(mockUserRepository.Object);

            // Mock StudentRepository
            var mockStudentRepository = new Mock<IStudentRepository>();
            _mockUnitOfWork.Setup(uow => uow.StudentRepository).Returns(mockStudentRepository.Object);

            _classService = new ClassService(_mockUnitOfWork.Object);
        }

        private void SeedTestData()
        {
            // Seed Teachers
            var teacher = new Teacher
            {
                TeacherId = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                User = new User
                {
                    Id = Guid.NewGuid(),
                    Email = "teacher@test.com",
                    UserName = "teacher@test.com",
                    Fullname = "Giáo viên test",
                    EmailConfirmed = true,
                    PhoneNumberConfirmed = true,
                    TwoFactorEnabled = false,
                    LockoutEnabled = true,
                    AccessFailedCount = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsActive = true
                }
            };
            _context.Teachers.Add(teacher);

            // Seed Subjects
            var subject = new Subject
            {
                SubjectId = 1,
                SubjectName = "Lập trình Web",
                Course = "WEB101",
                NoCredits = 3,
                Description = "Môn học về lập trình web cơ bản"
            };
            _context.Subjects.Add(subject);

            // Seed Semesters
            var semester = new Semester
            {
                SemesterId = 1,
                SemesterName = "Học kỳ 1 năm 2024",
                IsActive = true
            };
            _context.Semesters.Add(semester);

            _context.SaveChanges();
        }

        [Test]
        public async Task CreateClassAsync_ValidData_ReturnsSuccess()
        {
            // Arrange
            var classCreateDto = new ClassCreateDTO
            {
                ClassName = "Lớp CNTT1",
                TeacherId = _context.Teachers.First().TeacherId,
                SubjectId = 1,
                SemesterId = 1,
                Students = new List<StudentDTO>
                {
                    new StudentDTO
                    {
                        Email = "student1@test.com",
                        Code = "SV001",
                        FullName = "Sinh viên 1"
                    },
                    new StudentDTO
                    {
                        Email = "student2@test.com",
                        Code = "SV002",
                        FullName = "Sinh viên 2"
                    }
                }
            };

            // Mock ClassRepository.ClassExistsAsync to return false
            var mockClassRepository = Mock.Get(_mockUnitOfWork.Object.ClassRepository);
            mockClassRepository.Setup(repo => repo.ClassExistsAsync(It.IsAny<string>()))
                .ReturnsAsync(false);

            // Mock UserRepository.GetByCodeAndEmailAsync to return null (new user)
            var mockUserRepository = Mock.Get(_mockUnitOfWork.Object.UserRepository);
            mockUserRepository.Setup(repo => repo.GetByCodeAndEmailAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync((User)null);

            // Mock StudentRepository.GetStudentbyUserId to return null (new student)
            var mockStudentRepository = Mock.Get(_mockUnitOfWork.Object.StudentRepository);
            mockStudentRepository.Setup(repo => repo.GetStudentbyUserId(It.IsAny<Guid>()))
                .ReturnsAsync((Student)null);

            // Mock UserManager.CreateAsync to return success
            _mockUserManager.Setup(um => um.CreateAsync(It.IsAny<User>(), It.IsAny<string>()))
                .ReturnsAsync(IdentityResult.Success);

            // Mock RoleManager.RoleExistsAsync to return false (role doesn't exist)
            _mockRoleManager.Setup(rm => rm.RoleExistsAsync("Sinh viên"))
                .ReturnsAsync(false);

            // Mock RoleManager.CreateAsync to return success
            _mockRoleManager.Setup(rm => rm.CreateAsync(It.IsAny<IdentityRole<Guid>>()))
                .ReturnsAsync(IdentityResult.Success);

            // Mock UserManager.AddToRoleAsync to return success
            _mockUserManager.Setup(um => um.AddToRoleAsync(It.IsAny<User>(), "Sinh viên"))
                .ReturnsAsync(IdentityResult.Success);

            // Act
            var result = await _classService.CreateClassAsync(classCreateDto);

            // Assert
            result.Should().NotBeNull();
            result.ClassName.Should().Be("Lớp CNTT1");
            result.Students.Should().HaveCount(2);
        }

        [Test]
        public async Task CreateClassAsync_DuplicateClassName_ThrowsException()
        {
            // Arrange
            var existingClass = new Class
            {
                ClassName = "Lớp CNTT1",
                TeacherId = _context.Teachers.First().TeacherId,
                SubjectId = 1,
                SemesterId = 1,
                CreatedDate = DateTime.UtcNow
            };
            _context.Classes.Add(existingClass);
            await _context.SaveChangesAsync();

            var classCreateDto = new ClassCreateDTO
            {
                ClassName = "Lớp CNTT1", // Duplicate name
                TeacherId = _context.Teachers.First().TeacherId,
                SubjectId = 1,
                SemesterId = 1,
                Students = new List<StudentDTO>()
            };

            // Mock ClassExistsAsync to return true (class exists)
            _mockUnitOfWork.Setup(uow => uow.ClassRepository.ClassExistsAsync("Lớp CNTT1"))
                .ReturnsAsync(true);

            // Act & Assert
            await _classService.Invoking(s => s.CreateClassAsync(classCreateDto))
                .Should().ThrowAsync<Exception>();
        }

        [Test]
        public async Task CreateClassAsync_EmptyStudentEmail_ThrowsException()
        {
            // Arrange
            var classCreateDto = new ClassCreateDTO
            {
                ClassName = "Lớp CNTT1",
                TeacherId = _context.Teachers.First().TeacherId,
                SubjectId = 1,
                SemesterId = 1,
                Students = new List<StudentDTO>
                {
                    new StudentDTO
                    {
                        Email = "", // Empty email
                        Code = "SV001",
                        FullName = "Sinh viên 1"
                    }
                }
            };

            // Mock ClassExistsAsync to return false
            _mockUnitOfWork.Setup(uow => uow.ClassRepository.ClassExistsAsync(It.IsAny<string>()))
                .ReturnsAsync(false);

            // Act & Assert
            await _classService.Invoking(s => s.CreateClassAsync(classCreateDto))
                .Should().ThrowAsync<Exception>();
        }

        [Test]
        public async Task CreateClassAsync_EmptyStudentCode_ThrowsException()
        {
            // Arrange
            var classCreateDto = new ClassCreateDTO
            {
                ClassName = "Lớp CNTT1",
                TeacherId = _context.Teachers.First().TeacherId,
                SubjectId = 1,
                SemesterId = 1,
                Students = new List<StudentDTO>
                {
                    new StudentDTO
                    {
                        Email = "student1@test.com",
                        Code = "", // Empty code
                        FullName = "Sinh viên 1"
                    }
                }
            };

            // Mock ClassExistsAsync to return false
            _mockUnitOfWork.Setup(uow => uow.ClassRepository.ClassExistsAsync(It.IsAny<string>()))
                .ReturnsAsync(false);

            // Act & Assert
            await _classService.Invoking(s => s.CreateClassAsync(classCreateDto))
                .Should().ThrowAsync<Exception>();
        }

        [Test]
        public async Task CreateClassAsync_UserCreationFails_ThrowsException()
        {
            // Arrange
            var classCreateDto = new ClassCreateDTO
            {
                ClassName = "Lớp CNTT1",
                TeacherId = _context.Teachers.First().TeacherId,
                SubjectId = 1,
                SemesterId = 1,
                Students = new List<StudentDTO>
                {
                    new StudentDTO
                    {
                        Email = "student1@test.com",
                        Code = "SV001",
                        FullName = "Sinh viên 1"
                    }
                }
            };

            // Mock ClassExistsAsync to return false
            _mockUnitOfWork.Setup(uow => uow.ClassRepository.ClassExistsAsync(It.IsAny<string>()))
                .ReturnsAsync(false);

            // Mock UserManager.CreateAsync to return failure
            _mockUserManager.Setup(um => um.CreateAsync(It.IsAny<User>(), It.IsAny<string>()))
                .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "User creation failed" }));

            // Act & Assert
            await _classService.Invoking(s => s.CreateClassAsync(classCreateDto))
                .Should().ThrowAsync<Exception>();
        }

        [Test]
        public async Task CreateClassAsync_ExistingUser_AddsToClass()
        {
            // Arrange
            var existingUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "existing@test.com",
                UserName = "existing@test.com",
                Fullname = "Sinh viên đã tồn tại",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                TwoFactorEnabled = false,
                LockoutEnabled = true,
                AccessFailedCount = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };
            _context.Users.Add(existingUser);

            var existingStudent = new Student
            {
                StudentId = Guid.NewGuid(),
                UserId = existingUser.Id,
                User = existingUser,
                EnrollDate = DateTime.UtcNow,
                AvatarURL = "avatar.jpg"
            };
            _context.Students.Add(existingStudent);
            await _context.SaveChangesAsync();

            var classCreateDto = new ClassCreateDTO
            {
                ClassName = "Lớp CNTT1",
                TeacherId = _context.Teachers.First().TeacherId,
                SubjectId = 1,
                SemesterId = 1,
                Students = new List<StudentDTO>
                {
                    new StudentDTO
                    {
                        Email = "existing@test.com", // Existing user email
                        Code = "SV001",
                        FullName = "Sinh viên đã tồn tại"
                    }
                }
            };

            // Mock ClassRepository.ClassExistsAsync to return false
            var mockClassRepository = Mock.Get(_mockUnitOfWork.Object.ClassRepository);
            mockClassRepository.Setup(repo => repo.ClassExistsAsync(It.IsAny<string>()))
                .ReturnsAsync(false);

            // Mock UserRepository.GetByCodeAndEmailAsync to return existing user
            var mockUserRepository = Mock.Get(_mockUnitOfWork.Object.UserRepository);
            mockUserRepository.Setup(repo => repo.GetByCodeAndEmailAsync("SV001", "existing@test.com"))
                .ReturnsAsync(existingUser);

            // Mock StudentRepository.GetStudentbyUserId to return existing student
            var mockStudentRepository = Mock.Get(_mockUnitOfWork.Object.StudentRepository);
            mockStudentRepository.Setup(repo => repo.GetStudentbyUserId(existingUser.Id))
                .ReturnsAsync(existingStudent);

            // Act
            var result = await _classService.CreateClassAsync(classCreateDto);

            // Assert
            result.Should().NotBeNull();
            result.ClassName.Should().Be("Lớp CNTT1");
            result.Students.Should().HaveCount(1);
        }

        [TearDown]
        public void TearDown()
        {
            _context?.Dispose();
        }
    }
} 