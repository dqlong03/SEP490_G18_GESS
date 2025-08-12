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
    public class CreatePracticeExamAsyncTests
    {
        private GessDbContext _context;
        private PracticeExamRepository _repository;

        [SetUp]
        public void Setup()
        {
            // Khởi tạo In-Memory Database cho testing
            var options = new DbContextOptionsBuilder<GessDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new GessDbContext(options);

            // Khởi tạo repository
            _repository = new PracticeExamRepository(_context);

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

            // Tạo CategoryExam
            var categoryExam = new CategoryExam
            {
                CategoryExamId = 1,
                CategoryExamName = "Giữa kỳ"
            };
            _context.CategoryExams.Add(categoryExam);

            // Tạo Class
            var classEntity = new Class
            {
                ClassId = 1,
                ClassName = "SE1601",
       
            };
            _context.Classes.Add(classEntity);

            // Tạo PracticeExamPaper
            var practiceExamPaper = new PracticeExamPaper
            {
                PracExamPaperId = 1,
                PracExamPaperName = "Đề thi thực hành 1",
                Status = ""
            };
            _context.PracticeExamPapers.Add(practiceExamPaper);

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
                CohortId = 1,
                AvatarURL = "https://example.com/avatar.jpg"
            };
            _context.Students.Add(student);

            _context.SaveChanges();
        }

        [Test]
        public async Task CreatePracticeExamAsync_TestCase1_ValidAllData_ReturnsPracticeExam()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validCategoryExam = await _context.CategoryExams.FirstAsync();
            var validClass = await _context.Classes.FirstAsync();
            var validPracticeExamPaper = await _context.PracticeExamPapers.FirstAsync();
            var validStudent = await _context.Students.FirstAsync();

            var validDto = new PracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi thực hành Web",
                Duration = 90,
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(7).AddHours(2),
                CreateAt = DateTime.Now,
                TeacherId = validTeacher.TeacherId,
                CategoryExamId = validCategoryExam.CategoryExamId,
                SubjectId = validSubject.SubjectId,
                ClassId = validClass.ClassId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<PracticeExamPaperDTO>
                {
                    new PracticeExamPaperDTO
                    {
                        PracExamPaperId = validPracticeExamPaper.PracExamPaperId
                    }
                },
                StudentIds = new List<Guid> { validStudent.StudentId }
            };

            // Act
            var result = await _repository.CreatePracticeExamAsync(validDto);

            // Assert
            result.Should().NotBeNull();
            result.PracExamName.Should().Be("Kỳ thi thực hành Web");
            result.Duration.Should().Be(90);
            result.Status.Should().Be("Chưa mở ca");
            result.IsGraded.Should().Be(0);
            result.CodeStart.Should().NotBeNullOrEmpty();
            result.CodeStart.Length.Should().Be(6);
        }

        [Test]
        public async Task CreatePracticeExamAsync_TestCase2_InvalidPracExamNameEmpty_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validCategoryExam = await _context.CategoryExams.FirstAsync();
            var validClass = await _context.Classes.FirstAsync();
            var validPracticeExamPaper = await _context.PracticeExamPapers.FirstAsync();
            var validStudent = await _context.Students.FirstAsync();

            var invalidDto = new PracticeExamCreateDTO
            {
                PracExamName = "", // Tên rỗng
                Duration = 90,
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(7).AddHours(2),
                CreateAt = DateTime.Now,
                TeacherId = validTeacher.TeacherId,
                CategoryExamId = validCategoryExam.CategoryExamId,
                SubjectId = validSubject.SubjectId,
                ClassId = validClass.ClassId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<PracticeExamPaperDTO>
                {
                    new PracticeExamPaperDTO
                    {
                        PracExamPaperId = validPracticeExamPaper.PracExamPaperId
                    }
                },
                StudentIds = new List<Guid> { validStudent.StudentId }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreatePracticeExamAsync(invalidDto));
            exception.Message.Should().Be("Tên kỳ thi không được để trống!");
        }

        [Test]
        public async Task CreatePracticeExamAsync_TestCase3_InvalidPracExamNameDuplicate_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validCategoryExam = await _context.CategoryExams.FirstAsync();
            var validClass = await _context.Classes.FirstAsync();
            var validPracticeExamPaper = await _context.PracticeExamPapers.FirstAsync();
            var validStudent = await _context.Students.FirstAsync();

            // Tạo kỳ thi đầu tiên
            var firstDto = new PracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi thực hành Web",
                Duration = 90,
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(7).AddHours(2),
                CreateAt = DateTime.Now,
                TeacherId = validTeacher.TeacherId,
                CategoryExamId = validCategoryExam.CategoryExamId,
                SubjectId = validSubject.SubjectId,
                ClassId = validClass.ClassId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<PracticeExamPaperDTO>
                {
                    new PracticeExamPaperDTO
                    {
                        PracExamPaperId = validPracticeExamPaper.PracExamPaperId
                    }
                },
                StudentIds = new List<Guid> { validStudent.StudentId }
            };

            await _repository.CreatePracticeExamAsync(firstDto);

            // Tạo kỳ thi thứ hai với tên trùng
            var duplicateDto = new PracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi thực hành Web", // Tên trùng
                Duration = 60,
                StartDay = DateTime.Now.AddDays(14),
                EndDay = DateTime.Now.AddDays(14).AddHours(1),
                CreateAt = DateTime.Now,
                TeacherId = validTeacher.TeacherId,
                CategoryExamId = validCategoryExam.CategoryExamId,
                SubjectId = validSubject.SubjectId,
                ClassId = validClass.ClassId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<PracticeExamPaperDTO>
                {
                    new PracticeExamPaperDTO
                    {
                        PracExamPaperId = validPracticeExamPaper.PracExamPaperId
                    }
                },
                StudentIds = new List<Guid> { validStudent.StudentId }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreatePracticeExamAsync(duplicateDto));
            exception.Message.Should().Be("Đã tồn tại kỳ thi với tên 'Kỳ thi thực hành Web' trong học kỳ này!");
        }

        [Test]
        public async Task CreatePracticeExamAsync_TestCase4_InvalidDurationZero_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validCategoryExam = await _context.CategoryExams.FirstAsync();
            var validClass = await _context.Classes.FirstAsync();
            var validPracticeExamPaper = await _context.PracticeExamPapers.FirstAsync();
            var validStudent = await _context.Students.FirstAsync();

            var invalidDto = new PracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi thực hành Web",
                Duration = 0, // Thời gian = 0
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(7).AddHours(2),
                CreateAt = DateTime.Now,
                TeacherId = validTeacher.TeacherId,
                CategoryExamId = validCategoryExam.CategoryExamId,
                SubjectId = validSubject.SubjectId,
                ClassId = validClass.ClassId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<PracticeExamPaperDTO>
                {
                    new PracticeExamPaperDTO
                    {
                        PracExamPaperId = validPracticeExamPaper.PracExamPaperId
                    }
                },
                StudentIds = new List<Guid> { validStudent.StudentId }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreatePracticeExamAsync(invalidDto));
            exception.Message.Should().Be("Thời gian làm bài phải lớn hơn 0 phút!");
        }

        [Test]
        public async Task CreatePracticeExamAsync_TestCase5_InvalidDurationNegative_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validCategoryExam = await _context.CategoryExams.FirstAsync();
            var validClass = await _context.Classes.FirstAsync();
            var validPracticeExamPaper = await _context.PracticeExamPapers.FirstAsync();
            var validStudent = await _context.Students.FirstAsync();

            var invalidDto = new PracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi thực hành Web",
                Duration = -10, // Thời gian âm
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(7).AddHours(2),
                CreateAt = DateTime.Now,
                TeacherId = validTeacher.TeacherId,
                CategoryExamId = validCategoryExam.CategoryExamId,
                SubjectId = validSubject.SubjectId,
                ClassId = validClass.ClassId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<PracticeExamPaperDTO>
                {
                    new PracticeExamPaperDTO
                    {
                        PracExamPaperId = validPracticeExamPaper.PracExamPaperId
                    }
                },
                StudentIds = new List<Guid> { validStudent.StudentId }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreatePracticeExamAsync(invalidDto));
            exception.Message.Should().Be("Thời gian làm bài phải lớn hơn 0 phút!");
        }

        [Test]
        public async Task CreatePracticeExamAsync_TestCase6_InvalidStartDayNull_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validCategoryExam = await _context.CategoryExams.FirstAsync();
            var validClass = await _context.Classes.FirstAsync();
            var validPracticeExamPaper = await _context.PracticeExamPapers.FirstAsync();
            var validStudent = await _context.Students.FirstAsync();

            var invalidDto = new PracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi thực hành Web",
                Duration = 90,
                StartDay = default(DateTime), // Ngày null
                EndDay = DateTime.Now.AddDays(7).AddHours(2),
                CreateAt = DateTime.Now,
                TeacherId = validTeacher.TeacherId,
                CategoryExamId = validCategoryExam.CategoryExamId,
                SubjectId = validSubject.SubjectId,
                ClassId = validClass.ClassId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<PracticeExamPaperDTO>
                {
                    new PracticeExamPaperDTO
                    {
                        PracExamPaperId = validPracticeExamPaper.PracExamPaperId
                    }
                },
                StudentIds = new List<Guid> { validStudent.StudentId }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreatePracticeExamAsync(invalidDto));
            exception.Message.Should().Be("Ngày bắt đầu thi không được để trống!");
        }

        

        [Test]
        public async Task CreatePracticeExamAsync_TestCase8_InvalidEndDayNull_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validCategoryExam = await _context.CategoryExams.FirstAsync();
            var validClass = await _context.Classes.FirstAsync();
            var validPracticeExamPaper = await _context.PracticeExamPapers.FirstAsync();
            var validStudent = await _context.Students.FirstAsync();

            var invalidDto = new PracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi thực hành Web",
                Duration = 90,
                StartDay = DateTime.Now.AddDays(7),
                EndDay = default(DateTime), // Ngày null
                CreateAt = DateTime.Now,
                TeacherId = validTeacher.TeacherId,
                CategoryExamId = validCategoryExam.CategoryExamId,
                SubjectId = validSubject.SubjectId,
                ClassId = validClass.ClassId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<PracticeExamPaperDTO>
                {
                    new PracticeExamPaperDTO
                    {
                        PracExamPaperId = validPracticeExamPaper.PracExamPaperId
                    }
                },
                StudentIds = new List<Guid> { validStudent.StudentId }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreatePracticeExamAsync(invalidDto));
            exception.Message.Should().Be("Ngày kết thúc thi không được để trống!");
        }

        

        [Test]
        public async Task CreatePracticeExamAsync_TestCase10_InvalidEndDayBeforeStartDay_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validCategoryExam = await _context.CategoryExams.FirstAsync();
            var validClass = await _context.Classes.FirstAsync();
            var validPracticeExamPaper = await _context.PracticeExamPapers.FirstAsync();
            var validStudent = await _context.Students.FirstAsync();

            var invalidDto = new PracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi thực hành Web",
                Duration = 90,
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(6), // Ngày kết thúc trước ngày bắt đầu
                CreateAt = DateTime.Now,
                TeacherId = validTeacher.TeacherId,
                CategoryExamId = validCategoryExam.CategoryExamId,
                SubjectId = validSubject.SubjectId,
                ClassId = validClass.ClassId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<PracticeExamPaperDTO>
                {
                    new PracticeExamPaperDTO
                    {
                        PracExamPaperId = validPracticeExamPaper.PracExamPaperId
                    }
                },
                StudentIds = new List<Guid> { validStudent.StudentId }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreatePracticeExamAsync(invalidDto));
            exception.Message.Should().Be("Ngày kết thúc thi phải lớn hơn ngày bắt đầu thi!");
        }

        [Test]
        public async Task CreatePracticeExamAsync_TestCase11_InvalidCreateAtNull_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validCategoryExam = await _context.CategoryExams.FirstAsync();
            var validClass = await _context.Classes.FirstAsync();
            var validPracticeExamPaper = await _context.PracticeExamPapers.FirstAsync();
            var validStudent = await _context.Students.FirstAsync();

            var invalidDto = new PracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi thực hành Web",
                Duration = 90,
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(7).AddHours(2),
                CreateAt = default(DateTime), // Ngày tạo null
                TeacherId = validTeacher.TeacherId,
                CategoryExamId = validCategoryExam.CategoryExamId,
                SubjectId = validSubject.SubjectId,
                ClassId = validClass.ClassId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<PracticeExamPaperDTO>
                {
                    new PracticeExamPaperDTO
                    {
                        PracExamPaperId = validPracticeExamPaper.PracExamPaperId
                    }
                },
                StudentIds = new List<Guid> { validStudent.StudentId }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreatePracticeExamAsync(invalidDto));
            exception.Message.Should().Be("Ngày tạo kỳ thi không được để trống!");
        }

        [Test]
        public async Task CreatePracticeExamAsync_TestCase12_InvalidTeacherIdNotExist_ThrowsException()
        {
            // Arrange
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validCategoryExam = await _context.CategoryExams.FirstAsync();
            var validClass = await _context.Classes.FirstAsync();
            var validPracticeExamPaper = await _context.PracticeExamPapers.FirstAsync();
            var validStudent = await _context.Students.FirstAsync();

            var invalidDto = new PracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi thực hành Web",
                Duration = 90,
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(7).AddHours(2),
                CreateAt = DateTime.Now,
                TeacherId = Guid.NewGuid(), // TeacherId không tồn tại
                CategoryExamId = validCategoryExam.CategoryExamId,
                SubjectId = validSubject.SubjectId,
                ClassId = validClass.ClassId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<PracticeExamPaperDTO>
                {
                    new PracticeExamPaperDTO
                    {
                        PracExamPaperId = validPracticeExamPaper.PracExamPaperId
                    }
                },
                StudentIds = new List<Guid> { validStudent.StudentId }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreatePracticeExamAsync(invalidDto));
            exception.Message.Should().Be("Giáo viên không tồn tại!");
        }

        [Test]
        public async Task CreatePracticeExamAsync_TestCase13_InvalidCategoryExamIdNotExist_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validClass = await _context.Classes.FirstAsync();
            var validPracticeExamPaper = await _context.PracticeExamPapers.FirstAsync();
            var validStudent = await _context.Students.FirstAsync();

            var invalidDto = new PracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi thực hành Web",
                Duration = 90,
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(7).AddHours(2),
                CreateAt = DateTime.Now,
                TeacherId = validTeacher.TeacherId,
                CategoryExamId = 999, // CategoryExamId không tồn tại
                SubjectId = validSubject.SubjectId,
                ClassId = validClass.ClassId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<PracticeExamPaperDTO>
                {
                    new PracticeExamPaperDTO
                    {
                        PracExamPaperId = validPracticeExamPaper.PracExamPaperId
                    }
                },
                StudentIds = new List<Guid> { validStudent.StudentId }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreatePracticeExamAsync(invalidDto));
            exception.Message.Should().Be("Danh mục kỳ thi không tồn tại!");
        }

        [Test]
        public async Task CreatePracticeExamAsync_TestCase14_InvalidSubjectIdNotExist_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validCategoryExam = await _context.CategoryExams.FirstAsync();
            var validClass = await _context.Classes.FirstAsync();
            var validPracticeExamPaper = await _context.PracticeExamPapers.FirstAsync();
            var validStudent = await _context.Students.FirstAsync();

            var invalidDto = new PracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi thực hành Web",
                Duration = 90,
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(7).AddHours(2),
                CreateAt = DateTime.Now,
                TeacherId = validTeacher.TeacherId,
                CategoryExamId = validCategoryExam.CategoryExamId,
                SubjectId = 999, // SubjectId không tồn tại
                ClassId = validClass.ClassId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<PracticeExamPaperDTO>
                {
                    new PracticeExamPaperDTO
                    {
                        PracExamPaperId = validPracticeExamPaper.PracExamPaperId
                    }
                },
                StudentIds = new List<Guid> { validStudent.StudentId }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreatePracticeExamAsync(invalidDto));
            exception.Message.Should().Be("Môn học không tồn tại!");
        }

        [Test]
        public async Task CreatePracticeExamAsync_TestCase15_InvalidClassIdNotExist_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validCategoryExam = await _context.CategoryExams.FirstAsync();
            var validPracticeExamPaper = await _context.PracticeExamPapers.FirstAsync();
            var validStudent = await _context.Students.FirstAsync();

            var invalidDto = new PracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi thực hành Web",
                Duration = 90,
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(7).AddHours(2),
                CreateAt = DateTime.Now,
                TeacherId = validTeacher.TeacherId,
                CategoryExamId = validCategoryExam.CategoryExamId,
                SubjectId = validSubject.SubjectId,
                ClassId = 999, // ClassId không tồn tại
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<PracticeExamPaperDTO>
                {
                    new PracticeExamPaperDTO
                    {
                        PracExamPaperId = validPracticeExamPaper.PracExamPaperId
                    }
                },
                StudentIds = new List<Guid> { validStudent.StudentId }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreatePracticeExamAsync(invalidDto));
            exception.Message.Should().Be("Lớp học không tồn tại!");
        }

        [Test]
        public async Task CreatePracticeExamAsync_TestCase16_InvalidSemesterIdNotExist_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validCategoryExam = await _context.CategoryExams.FirstAsync();
            var validClass = await _context.Classes.FirstAsync();
            var validPracticeExamPaper = await _context.PracticeExamPapers.FirstAsync();
            var validStudent = await _context.Students.FirstAsync();

            var invalidDto = new PracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi thực hành Web",
                Duration = 90,
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(7).AddHours(2),
                CreateAt = DateTime.Now,
                TeacherId = validTeacher.TeacherId,
                CategoryExamId = validCategoryExam.CategoryExamId,
                SubjectId = validSubject.SubjectId,
                ClassId = validClass.ClassId,
                SemesterId = 999, // SemesterId không tồn tại
                PracticeExamPaperDTO = new List<PracticeExamPaperDTO>
                {
                    new PracticeExamPaperDTO
                    {
                        PracExamPaperId = validPracticeExamPaper.PracExamPaperId
                    }
                },
                StudentIds = new List<Guid> { validStudent.StudentId }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreatePracticeExamAsync(invalidDto));
            exception.Message.Should().Be("Học kỳ không tồn tại!");
        }

        [Test]
        public async Task CreatePracticeExamAsync_TestCase17_InvalidPracticeExamPaperDTOEmpty_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validCategoryExam = await _context.CategoryExams.FirstAsync();
            var validClass = await _context.Classes.FirstAsync();
            var validStudent = await _context.Students.FirstAsync();

            var invalidDto = new PracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi thực hành Web",
                Duration = 90,
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(7).AddHours(2),
                CreateAt = DateTime.Now,
                TeacherId = validTeacher.TeacherId,
                CategoryExamId = validCategoryExam.CategoryExamId,
                SubjectId = validSubject.SubjectId,
                ClassId = validClass.ClassId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<PracticeExamPaperDTO>(), // Danh sách rỗng
                StudentIds = new List<Guid> { validStudent.StudentId }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreatePracticeExamAsync(invalidDto));
            exception.Message.Should().Be("Danh sách đề thi không được để trống!");
        }

        [Test]
        public async Task CreatePracticeExamAsync_TestCase18_InvalidPracticeExamPaperIdNotExist_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validCategoryExam = await _context.CategoryExams.FirstAsync();
            var validClass = await _context.Classes.FirstAsync();
            var validStudent = await _context.Students.FirstAsync();

            var invalidDto = new PracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi thực hành Web",
                Duration = 90,
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(7).AddHours(2),
                CreateAt = DateTime.Now,
                TeacherId = validTeacher.TeacherId,
                CategoryExamId = validCategoryExam.CategoryExamId,
                SubjectId = validSubject.SubjectId,
                ClassId = validClass.ClassId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<PracticeExamPaperDTO>
                {
                    new PracticeExamPaperDTO
                    {
                        PracExamPaperId = 999 // PracExamPaperId không tồn tại
                    }
                },
                StudentIds = new List<Guid> { validStudent.StudentId }
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreatePracticeExamAsync(invalidDto));
            exception.Message.Should().Be("Đề thi với ID 999 không tồn tại!");
        }

        [Test]
        public async Task CreatePracticeExamAsync_TestCase19_InvalidStudentIdsEmpty_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validCategoryExam = await _context.CategoryExams.FirstAsync();
            var validClass = await _context.Classes.FirstAsync();
            var validPracticeExamPaper = await _context.PracticeExamPapers.FirstAsync();

            var invalidDto = new PracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi thực hành Web",
                Duration = 90,
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(7).AddHours(2),
                CreateAt = DateTime.Now,
                TeacherId = validTeacher.TeacherId,
                CategoryExamId = validCategoryExam.CategoryExamId,
                SubjectId = validSubject.SubjectId,
                ClassId = validClass.ClassId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<PracticeExamPaperDTO>
                {
                    new PracticeExamPaperDTO
                    {
                        PracExamPaperId = validPracticeExamPaper.PracExamPaperId
                    }
                },
                StudentIds = new List<Guid>() // Danh sách rỗng
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreatePracticeExamAsync(invalidDto));
            exception.Message.Should().Be("Danh sách sinh viên không được để trống!");
        }

        [Test]
        public async Task CreatePracticeExamAsync_TestCase20_InvalidStudentIdNotExist_ThrowsException()
        {
            // Arrange
            var validTeacher = await _context.Teachers.FirstAsync();
            var validSubject = await _context.Subjects.FirstAsync();
            var validSemester = await _context.Semesters.FirstAsync();
            var validCategoryExam = await _context.CategoryExams.FirstAsync();
            var validClass = await _context.Classes.FirstAsync();
            var validPracticeExamPaper = await _context.PracticeExamPapers.FirstAsync();

            var invalidDto = new PracticeExamCreateDTO
            {
                PracExamName = "Kỳ thi thực hành Web",
                Duration = 90,
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(7).AddHours(2),
                CreateAt = DateTime.Now,
                TeacherId = validTeacher.TeacherId,
                CategoryExamId = validCategoryExam.CategoryExamId,
                SubjectId = validSubject.SubjectId,
                ClassId = validClass.ClassId,
                SemesterId = validSemester.SemesterId,
                PracticeExamPaperDTO = new List<PracticeExamPaperDTO>
                {
                    new PracticeExamPaperDTO
                    {
                        PracExamPaperId = validPracticeExamPaper.PracExamPaperId
                    }
                },
                StudentIds = new List<Guid> { Guid.NewGuid() } // StudentId không tồn tại
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.CreatePracticeExamAsync(invalidDto));
            exception.Message.Should().Contain("không tồn tại!");
        }
    }
} 