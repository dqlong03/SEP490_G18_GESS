using FluentAssertions;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Student;
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
    public class AddStudentsToClassServiceTests
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

            // Seed existing Class
            var existingClass = new Class
            {
                ClassId = 1,
                ClassName = "Lớp CNTT1",
                TeacherId = teacher.TeacherId,
                SubjectId = 1,
                SemesterId = 1,
                CreatedDate = DateTime.UtcNow,
                ClassStudents = new List<ClassStudent>()
            };
            _context.Classes.Add(existingClass);

            _context.SaveChanges();
        }

        [Test]
        public async Task AddStudentsToClassAsync_ValidData_ReturnsSuccess()
        {
            // Arrange
            var request = new AddStudentsToClassRequest
            {
                ClassId = 1,
                Students = new List<StudentAddDto>
                {
                    new StudentAddDto
                    {
                        Email = "student1@test.com",
                        Code = "SV001",
                        FullName = "Sinh viên 1"
                    },
                    new StudentAddDto
                    {
                        Email = "student2@test.com",
                        Code = "SV002",
                        FullName = "Sinh viên 2"
                    }
                }
            };

            // Mock ClassRepository.GetByIdAsync to return existing class
            var mockClassRepository = Mock.Get(_mockUnitOfWork.Object.ClassRepository);
            mockClassRepository.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(_context.Classes.First());

            // Mock UserRepository.GetByCodeAndEmailAsync to return null (new users)
            var mockUserRepository = Mock.Get(_mockUnitOfWork.Object.UserRepository);
            mockUserRepository.Setup(repo => repo.GetByCodeAndEmailAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync((User)null);

            // Mock StudentRepository.GetStudentbyUserId to return null (new students)
            var mockStudentRepository = Mock.Get(_mockUnitOfWork.Object.StudentRepository);
            mockStudentRepository.Setup(repo => repo.GetStudentbyUserId(It.IsAny<Guid>()))
                .ReturnsAsync((Student)null);

            // Mock ClassRepository.CheckIfStudentInClassAsync to return false (not in class)
            mockClassRepository.Setup(repo => repo.CheckIfStudentInClassAsync(It.IsAny<int>(), It.IsAny<Guid>()))
                .ReturnsAsync(false);

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
            await _classService.Invoking(s => s.AddStudentsToClassAsync(request))
                .Should().NotThrowAsync();
        }

        [Test]
        public async Task AddStudentsToClassAsync_ClassNotFound_ThrowsException()
        {
            // Arrange
            var request = new AddStudentsToClassRequest
            {
                ClassId = 999, // Non-existent class
                Students = new List<StudentAddDto>
                {
                    new StudentAddDto
                    {
                        Email = "student1@test.com",
                        Code = "SV001",
                        FullName = "Sinh viên 1"
                    }
                }
            };

            // Mock ClassRepository.GetByIdAsync to return null
            var mockClassRepository = Mock.Get(_mockUnitOfWork.Object.ClassRepository);
            mockClassRepository.Setup(repo => repo.GetByIdAsync(999))
                .ReturnsAsync((Class)null);

            // Act & Assert
            await _classService.Invoking(s => s.AddStudentsToClassAsync(request))
                .Should().ThrowAsync<Exception>()
                .WithMessage("Lớp học không tồn tại.");
        }

        [Test]
        public async Task AddStudentsToClassAsync_EmptyStudentEmail_ThrowsException()
        {
            // Arrange
            var request = new AddStudentsToClassRequest
            {
                ClassId = 1,
                Students = new List<StudentAddDto>
                {
                    new StudentAddDto
                    {
                        Email = "", // Empty email
                        Code = "SV001",
                        FullName = "Sinh viên 1"
                    }
                }
            };

            // Mock ClassRepository.GetByIdAsync to return existing class
            var mockClassRepository = Mock.Get(_mockUnitOfWork.Object.ClassRepository);
            mockClassRepository.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(_context.Classes.First());

            // Act & Assert
            await _classService.Invoking(s => s.AddStudentsToClassAsync(request))
                .Should().ThrowAsync<Exception>()
                .WithMessage("Email và mã sinh viên là bắt buộc.");
        }

        [Test]
        public async Task AddStudentsToClassAsync_EmptyStudentCode_ThrowsException()
        {
            // Arrange
            var request = new AddStudentsToClassRequest
            {
                ClassId = 1,
                Students = new List<StudentAddDto>
                {
                    new StudentAddDto
                    {
                        Email = "student1@test.com",
                        Code = "", // Empty code
                        FullName = "Sinh viên 1"
                    }
                }
            };

            // Mock ClassRepository.GetByIdAsync to return existing class
            var mockClassRepository = Mock.Get(_mockUnitOfWork.Object.ClassRepository);
            mockClassRepository.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(_context.Classes.First());

            // Act & Assert
            await _classService.Invoking(s => s.AddStudentsToClassAsync(request))
                .Should().ThrowAsync<Exception>()
                .WithMessage("Email và mã sinh viên là bắt buộc.");
        }

        [Test]
        public async Task AddStudentsToClassAsync_DuplicateStudentInClass_ThrowsException()
        {
            // Arrange
            var request = new AddStudentsToClassRequest
            {
                ClassId = 1,
                Students = new List<StudentAddDto>
                {
                    new StudentAddDto
                    {
                        Email = "student1@test.com",
                        Code = "SV001",
                        FullName = "Sinh viên 1"
                    }
                }
            };

            // Mock ClassRepository.GetByIdAsync to return existing class
            var mockClassRepository = Mock.Get(_mockUnitOfWork.Object.ClassRepository);
            mockClassRepository.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(_context.Classes.First());

            // Mock UserRepository.GetByCodeAndEmailAsync to return existing user
            var existingUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "student1@test.com",
                UserName = "student1@test.com",
                Fullname = "Sinh viên 1"
            };
            var mockUserRepository = Mock.Get(_mockUnitOfWork.Object.UserRepository);
            mockUserRepository.Setup(repo => repo.GetByCodeAndEmailAsync("SV001", "student1@test.com"))
                .ReturnsAsync(existingUser);

            // Mock StudentRepository.GetStudentbyUserId to return existing student
            var existingStudent = new Student
            {
                StudentId = Guid.NewGuid(),
                UserId = existingUser.Id
            };
            var mockStudentRepository = Mock.Get(_mockUnitOfWork.Object.StudentRepository);
            mockStudentRepository.Setup(repo => repo.GetStudentbyUserId(existingUser.Id))
                .ReturnsAsync(existingStudent);

            // Mock ClassRepository.CheckIfStudentInClassAsync to return true (already in class)
            mockClassRepository.Setup(repo => repo.CheckIfStudentInClassAsync(1, existingStudent.StudentId))
                .ReturnsAsync(true);

            // Act & Assert
            await _classService.Invoking(s => s.AddStudentsToClassAsync(request))
                .Should().ThrowAsync<Exception>()
                .WithMessage("*Các sinh viên đã tồn tại trong lớp*");
        }

        [Test]
        public async Task AddStudentsToClassAsync_UserCreationFails_ThrowsException()
        {
            // Arrange
            var request = new AddStudentsToClassRequest
            {
                ClassId = 1,
                Students = new List<StudentAddDto>
                {
                    new StudentAddDto
                    {
                        Email = "student1@test.com",
                        Code = "SV001",
                        FullName = "Sinh viên 1"
                    }
                }
            };

            // Mock ClassRepository.GetByIdAsync to return existing class
            var mockClassRepository = Mock.Get(_mockUnitOfWork.Object.ClassRepository);
            mockClassRepository.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(_context.Classes.First());

            // Mock UserRepository.GetByCodeAndEmailAsync to return null (new user)
            var mockUserRepository = Mock.Get(_mockUnitOfWork.Object.UserRepository);
            mockUserRepository.Setup(repo => repo.GetByCodeAndEmailAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync((User)null);

            // Mock UserManager.CreateAsync to return failure
            _mockUserManager.Setup(um => um.CreateAsync(It.IsAny<User>(), It.IsAny<string>()))
                .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "User creation failed" }));

            // Act & Assert
            await _classService.Invoking(s => s.AddStudentsToClassAsync(request))
                .Should().ThrowAsync<Exception>()
                .WithMessage("*Không thể tạo người dùng*");
        }

        [Test]
        public async Task AddStudentsToClassAsync_ExistingUser_AddsToClass()
        {
            // Arrange
            var request = new AddStudentsToClassRequest
            {
                ClassId = 1,
                Students = new List<StudentAddDto>
                {
                    new StudentAddDto
                    {
                        Email = "existing@test.com",
                        Code = "SV001",
                        FullName = "Sinh viên đã tồn tại"
                    }
                }
            };

            // Mock ClassRepository.GetByIdAsync to return existing class
            var mockClassRepository = Mock.Get(_mockUnitOfWork.Object.ClassRepository);
            mockClassRepository.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(_context.Classes.First());

            // Mock UserRepository.GetByCodeAndEmailAsync to return existing user
            var existingUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "existing@test.com",
                UserName = "existing@test.com",
                Fullname = "Sinh viên đã tồn tại"
            };
            var mockUserRepository = Mock.Get(_mockUnitOfWork.Object.UserRepository);
            mockUserRepository.Setup(repo => repo.GetByCodeAndEmailAsync("SV001", "existing@test.com"))
                .ReturnsAsync(existingUser);

            // Mock StudentRepository.GetStudentbyUserId to return existing student
            var existingStudent = new Student
            {
                StudentId = Guid.NewGuid(),
                UserId = existingUser.Id
            };
            var mockStudentRepository = Mock.Get(_mockUnitOfWork.Object.StudentRepository);
            mockStudentRepository.Setup(repo => repo.GetStudentbyUserId(existingUser.Id))
                .ReturnsAsync(existingStudent);

            // Mock ClassRepository.CheckIfStudentInClassAsync to return false (not in class)
            mockClassRepository.Setup(repo => repo.CheckIfStudentInClassAsync(1, existingStudent.StudentId))
                .ReturnsAsync(false);

            // Act
            await _classService.Invoking(s => s.AddStudentsToClassAsync(request))
                .Should().NotThrowAsync();
        }

        [TearDown]
        public void TearDown()
        {
            _context?.Dispose();
        }
    }
} 