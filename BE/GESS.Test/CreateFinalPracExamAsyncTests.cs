using NUnit.Framework;
using Microsoft.EntityFrameworkCore;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Implement;
using GESS.Model.PracticeExam;
using GESS.Model.PracticeExamPaper;
using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using System.Collections.Generic;

namespace GESS.Test
{
    [TestFixture]
    public class CreateFinalPracExamAsyncTests
    {
        private GessDbContext _context;
        private FinaExamRepository _repository;

        [SetUp]
        public void Setup()
        {
            // Khởi tạo In-Memory Database cho testing
            var options = new DbContextOptionsBuilder<GessDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new GessDbContext(options);

            // Khởi tạo repository
            _repository = new FinaExamRepository(_context);

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

            // Tạo PracticeExamPaper
            var practiceExamPaper = new PracticeExamPaper
            {
                PracExamPaperId = 1,
                PracExamPaperName = "Đề thi cuối kỳ Web",
                SubjectId = 1,
                SemesterId = 1,
                CategoryExamId = 2,
                CreateAt = DateTime.Now,
                Status =""

            };
            _context.PracticeExamPapers.Add(practiceExamPaper);

            // Tạo PracticeExamPaper khác cho test
            var practiceExamPaper2 = new PracticeExamPaper
            {
                PracExamPaperId = 2,
                PracExamPaperName = "Đề thi cuối kỳ Web 2",
                SubjectId = 1,
                SemesterId = 1,
                CategoryExamId = 2,
                CreateAt = DateTime.Now,
                Status = ""
            };
            _context.PracticeExamPapers.Add(practiceExamPaper2);

            _context.SaveChanges();
        }

        [Test]
        public async Task CreateFinalPracExamAsync_TestCase1_ValidAllData_ReturnsExam()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validExamPaper = await _context.PracticeExamPapers.FirstAsync();

            var request = new FinalPracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi cuối kỳ Web hợp lệ",
                TeacherId = validTeacher.TeacherId,
                SubjectId = validSubject.SubjectId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<FinalPracticeExamPaperDTO>
                {
                    new FinalPracticeExamPaperDTO { PracExamPaperId = validExamPaper.PracExamPaperId }
                }
            };

            // Act
            var result = await _repository.CreateFinalPracExamAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.PracExamName.Should().Be("Kỳ thi cuối kỳ Web hợp lệ");
            result.TeacherId.Should().Be(validTeacher.TeacherId);
            result.SubjectId.Should().Be(validSubject.SubjectId);
            result.SemesterId.Should().Be(validSemester.SemesterId);

            // Kiểm tra xem PracticeExam đã được tạo trong database
            var createdExam = await _context.PracticeExams
                .FirstOrDefaultAsync(e => e.PracExamName == "Kỳ thi cuối kỳ Web hợp lệ");
            createdExam.Should().NotBeNull();
            createdExam.CategoryExamId.Should().Be(2); // Final exam
        }

        [Test]
        public async Task CreateFinalPracExamAsync_TestCase2_InvalidPracExamName_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validExamPaper = await _context.PracticeExamPapers.FirstAsync();

            var request = new FinalPracticeExamCreateDTO
            {
                PracExamName = "", // Invalid: empty name
                TeacherId = validTeacher.TeacherId,
                SubjectId = validSubject.SubjectId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<FinalPracticeExamPaperDTO>
                {
                    new FinalPracticeExamPaperDTO { PracExamPaperId = validExamPaper.PracExamPaperId }
                }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreateFinalPracExamAsync(request));
            exception.Message.Should().Be("Tên kỳ thi không được để trống!");
        }

        [Test]
        public async Task CreateFinalPracExamAsync_TestCase3_InvalidPracExamNameTooLong_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validExamPaper = await _context.PracticeExamPapers.FirstAsync();

            var request = new FinalPracticeExamCreateDTO
            {
                PracExamName = new string('A', 101), // Invalid: too long (101 characters)
                TeacherId = validTeacher.TeacherId,
                SubjectId = validSubject.SubjectId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<FinalPracticeExamPaperDTO>
                {
                    new FinalPracticeExamPaperDTO { PracExamPaperId = validExamPaper.PracExamPaperId }
                }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreateFinalPracExamAsync(request));
            exception.Message.Should().Be("Tên kỳ thi không được vượt quá 100 ký tự!");
        }

        [Test]
        public async Task CreateFinalPracExamAsync_TestCase4_InvalidTeacherId_ThrowsException()
        {
            // Arrange
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validExamPaper = await _context.PracticeExamPapers.FirstAsync();

            var request = new FinalPracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi cuối kỳ Web",
                TeacherId = Guid.NewGuid(), // Invalid: non-existent teacher
                SubjectId = validSubject.SubjectId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<FinalPracticeExamPaperDTO>
                {
                    new FinalPracticeExamPaperDTO { PracExamPaperId = validExamPaper.PracExamPaperId }
                }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreateFinalPracExamAsync(request));
            exception.Message.Should().Be("Giáo viên không tồn tại!");
        }

        [Test]
        public async Task CreateFinalPracExamAsync_TestCase5_InvalidSubjectId_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validExamPaper = await _context.PracticeExamPapers.FirstAsync();

            var request = new FinalPracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi cuối kỳ Web",
                TeacherId = validTeacher.TeacherId,
                SubjectId = 999, // Invalid: non-existent subject
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<FinalPracticeExamPaperDTO>
                {
                    new FinalPracticeExamPaperDTO { PracExamPaperId = validExamPaper.PracExamPaperId }
                }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreateFinalPracExamAsync(request));
            exception.Message.Should().Be("Môn học không tồn tại!");
        }

        [Test]
        public async Task CreateFinalPracExamAsync_TestCase6_InvalidSemesterId_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validExamPaper = await _context.PracticeExamPapers.FirstAsync();

            var request = new FinalPracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi cuối kỳ Web",
                TeacherId = validTeacher.TeacherId,
                SubjectId = validSubject.SubjectId,
                SemesterId = 999, // Invalid: non-existent semester
                PracticeExamPaperDTO = new List<FinalPracticeExamPaperDTO>
                {
                    new FinalPracticeExamPaperDTO { PracExamPaperId = validExamPaper.PracExamPaperId }
                }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreateFinalPracExamAsync(request));
            exception.Message.Should().Be("Học kỳ không tồn tại!");
        }

        [Test]
        public async Task CreateFinalPracExamAsync_TestCase7_InvalidExamPaperId_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();

            var request = new FinalPracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi cuối kỳ Web",
                TeacherId = validTeacher.TeacherId,
                SubjectId = validSubject.SubjectId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<FinalPracticeExamPaperDTO>
                {
                    new FinalPracticeExamPaperDTO { PracExamPaperId = 999 } // Invalid: non-existent exam paper
                }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreateFinalPracExamAsync(request));
            exception.Message.Should().Be("Đề thi với ID 999 không tồn tại!");
        }

        [Test]
        public async Task CreateFinalPracExamAsync_TestCase8_EmptyPracticeExamPaperDTO_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();

            var request = new FinalPracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi cuối kỳ Web",
                TeacherId = validTeacher.TeacherId,
                SubjectId = validSubject.SubjectId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<FinalPracticeExamPaperDTO>() // Invalid: empty list
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreateFinalPracExamAsync(request));
            exception.Message.Should().Be("Danh sách đề thi không được để trống!");
        }

        [Test]
        public async Task CreateFinalPracExamAsync_TestCase9_NullPracticeExamPaperDTO_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();

            var request = new FinalPracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi cuối kỳ Web",
                TeacherId = validTeacher.TeacherId,
                SubjectId = validSubject.SubjectId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = null // Invalid: null list
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreateFinalPracExamAsync(request));
            exception.Message.Should().Be("Danh sách đề thi không được để trống!");
        }

        [Test]
        public async Task CreateFinalPracExamAsync_TestCase10_ExamPaperWrongSubject_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validExamPaper = await _context.PracticeExamPapers.FirstAsync();

            // Tạo subject khác
            var differentSubject = new Subject
            {
                SubjectId = 2,
                SubjectName = "Lập trình Mobile",
                Course = "MOB101",
                NoCredits = 3,
                Description = "Môn học về lập trình mobile"
            };
            _context.Subjects.Add(differentSubject);

            // Tạo exam paper cho subject khác
            var examPaperForDifferentSubject = new PracticeExamPaper
            {
                PracExamPaperId = 3,
                PracExamPaperName = "Đề thi cuối kỳ Mobile",
                SubjectId = 2, // Different subject
                SemesterId = 1,
                CategoryExamId = 2,
                CreateAt = DateTime.Now,
                Status = ""
            };
            _context.PracticeExamPapers.Add(examPaperForDifferentSubject);
            await _context.SaveChangesAsync();

            var request = new FinalPracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi cuối kỳ Web",
                TeacherId = validTeacher.TeacherId,
                SubjectId = validSubject.SubjectId, // Subject 1
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<FinalPracticeExamPaperDTO>
                {
                    new FinalPracticeExamPaperDTO { PracExamPaperId = 3 } // Exam paper for subject 2
                }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreateFinalPracExamAsync(request));
            exception.Message.Should().Be("Đề thi 3 không thuộc về môn học đã chọn!");
        }

        [Test]
        public async Task CreateFinalPracExamAsync_TestCase11_ExamPaperWrongSemester_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validExamPaper = await _context.PracticeExamPapers.FirstAsync();

            // Tạo semester khác
            var differentSemester = new Semester
            {
                SemesterId = 2,
                SemesterName = "Học kỳ 2",
                IsActive = true
            };
            _context.Semesters.Add(differentSemester);

            // Tạo exam paper cho semester khác
            var examPaperForDifferentSemester = new PracticeExamPaper
            {
                PracExamPaperId = 4,
                PracExamPaperName = "Đề thi cuối kỳ Web HK2",
                SubjectId = 1, // Same subject
                SemesterId = 2, // Different semester
                CategoryExamId = 2,
                CreateAt = DateTime.Now,
                Status = ""
            };
            _context.PracticeExamPapers.Add(examPaperForDifferentSemester);
            await _context.SaveChangesAsync();

            var request = new FinalPracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi cuối kỳ Web",
                TeacherId = validTeacher.TeacherId,
                SubjectId = validSubject.SubjectId,
                SemesterId = validSemester.SemesterId, // Semester 1
                PracticeExamPaperDTO = new List<FinalPracticeExamPaperDTO>
                {
                    new FinalPracticeExamPaperDTO { PracExamPaperId = 4 } // Exam paper for semester 2
                }
            };

                         // Act & Assert
             var exception = Assert.ThrowsAsync<Exception>(async () =>
                 await _repository.CreateFinalPracExamAsync(request));
             exception.Message.Should().Be("Đề thi 4 không thuộc về học kỳ đã chọn!");
         }

        [Test]
        public async Task CreateFinalPracExamAsync_TestCase12_DuplicateExamNameInSameSemester_ThrowsException()
        {
            // Arrange: Tạo kỳ thi đầu tiên
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validExamPaper = await _context.PracticeExamPapers.FirstAsync();

            var firstExamRequest = new FinalPracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi cuối kỳ Web",
                TeacherId = validTeacher.TeacherId,
                SubjectId = validSubject.SubjectId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<FinalPracticeExamPaperDTO>
                {
                    new FinalPracticeExamPaperDTO { PracExamPaperId = validExamPaper.PracExamPaperId }
                }
            };

            // Tạo kỳ thi đầu tiên
            await _repository.CreateFinalPracExamAsync(firstExamRequest);

            // Tạo kỳ thi thứ hai với cùng tên trong cùng học kỳ
            var duplicateExamRequest = new FinalPracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi cuối kỳ Web", // Cùng tên
                TeacherId = validTeacher.TeacherId,
                SubjectId = validSubject.SubjectId,
                SemesterId = validSemester.SemesterId, // Cùng học kỳ
                PracticeExamPaperDTO = new List<FinalPracticeExamPaperDTO>
                {
                    new FinalPracticeExamPaperDTO { PracExamPaperId = validExamPaper.PracExamPaperId }
                }
            };

            // Act & Assert: Ném exception khi tạo kỳ thi trùng tên
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreateFinalPracExamAsync(duplicateExamRequest));
            exception.Message.Should().Be("Đã tồn tại kỳ thi với tên 'Kỳ thi cuối kỳ Web' trong học kỳ này!");
        }

        [Test]
        public async Task CreateFinalPracExamAsync_TestCase13_DuplicateExamNameInDifferentSemester_Success()
        {
            // Arrange: Tạo kỳ thi đầu tiên
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validExamPaper = await _context.PracticeExamPapers.FirstAsync();

            var firstExamRequest = new FinalPracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi cuối kỳ Web",
                TeacherId = validTeacher.TeacherId,
                SubjectId = validSubject.SubjectId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<FinalPracticeExamPaperDTO>
                {
                    new FinalPracticeExamPaperDTO { PracExamPaperId = validExamPaper.PracExamPaperId }
                }
            };

            // Tạo kỳ thi đầu tiên
            await _repository.CreateFinalPracExamAsync(firstExamRequest);

            // Tạo semester khác
            var differentSemester = new Semester
            {
                SemesterId = 2,
                SemesterName = "Học kỳ 2",
                IsActive = true
            };
            _context.Semesters.Add(differentSemester);

            // Tạo exam paper cho semester khác
            var examPaperForDifferentSemester = new PracticeExamPaper
            {
                PracExamPaperId = 5,
                PracExamPaperName = "Đề thi cuối kỳ Web HK2",
                SubjectId = 1,
                SemesterId = 2, // Khác semester
                CategoryExamId = 2,
                CreateAt = DateTime.Now,
                Status = ""
            };
            _context.PracticeExamPapers.Add(examPaperForDifferentSemester);
            await _context.SaveChangesAsync();

            // Tạo kỳ thi thứ hai với cùng tên nhưng khác học kỳ
            var duplicateExamRequest = new FinalPracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi cuối kỳ Web", // Cùng tên
                TeacherId = validTeacher.TeacherId,
                SubjectId = validSubject.SubjectId,
                SemesterId = 2, // Khác học kỳ
                PracticeExamPaperDTO = new List<FinalPracticeExamPaperDTO>
                {
                    new FinalPracticeExamPaperDTO { PracExamPaperId = 5 }
                }
            };

            // Act: Tạo kỳ thi thứ hai
            var result = await _repository.CreateFinalPracExamAsync(duplicateExamRequest);

            // Assert: Thành công vì khác học kỳ
            result.Should().NotBeNull();
            result.PracExamName.Should().Be("Kỳ thi cuối kỳ Web");
            result.SemesterId.Should().Be(2);
        }
    }
 } 