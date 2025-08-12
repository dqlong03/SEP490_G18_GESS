using NUnit.Framework;
using Microsoft.EntityFrameworkCore;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Implement;
using GESS.Model.MultipleExam;
using GESS.Model.NoQuestionInChapter;
using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using System.Collections.Generic; // Added missing import for List

namespace GESS.Test
{
    [TestFixture]
    public class CreateFinalMultipleExamAsyncTests
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

            // Tạo Chapter
            var chapter = new Chapter
            {
                ChapterId = 1,
                ChapterName = "Chương 1",
                SubjectId = 1,
                Description = "Mô tả chương 1"
            };
            _context.Chapters.Add(chapter);

            // Tạo LevelQuestion
            var levelQuestion = new LevelQuestion
            {
                LevelQuestionId = 1,
                LevelQuestionName = "Dễ",

            };
            _context.LevelQuestions.Add(levelQuestion);

            // Tạo MultiQuestions
            for (int i = 1; i <= 10; i++)
            {
                var multiQuestion = new MultiQuestion
                {
                    MultiQuestionId = i,
                    Content = $"Câu hỏi trắc nghiệm {i}",
                    IsActive = true,
                    CreatedBy = teacherUser.Id,
                    IsPublic = true,
                    ChapterId = 1,
                    CategoryExamId = 1,
                    LevelQuestionId = 1,
                    SemesterId = 1,
                    CreateAt = DateTime.Now
                };
                _context.MultiQuestions.Add(multiQuestion);
            }

            _context.SaveChanges();
        }

        // ========== CREATE FINAL MULTIPLE EXAM ASYNC TEST CASES ==========

        [Test]
        public async Task CreateFinalMultipleExamAsync_TestCase1_ValidAllData_ReturnsExam()
        {
            // Arrange: Tất cả dữ liệu hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;
            var validDto = new FinalMultipleExamCreateDTO
            {
                MultiExamName = "Bài thi cuối kỳ 1",
                NumberQuestion = 5,
                CreateAt = DateTime.Now.AddDays(1),
                TeacherId = teacherId,
                SubjectId = 1,
                SemesterId = 1,
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 1,
                        LevelQuestionId = 1,
                        NumberQuestion = 5
                    }
                }
            };

            // Act: Tạo kỳ thi
            var result = await _repository.CreateFinalMultipleExamAsync(validDto);

            // Assert: Trả về kỳ thi đã tạo
            result.Should().NotBeNull();
            result.MultiExamName.Should().Be("Bài thi cuối kỳ 1");
            result.NumberQuestion.Should().Be(5);
            result.TeacherId.Should().Be(teacherId);
            result.SubjectId.Should().Be(1);
            result.SemesterId.Should().Be(1);
        }

        [Test]
        public async Task CreateFinalMultipleExamAsync_TestCase2_InvalidMultiExamName_ThrowsException()
        {
            // Arrange: MultiExamName không hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;
            var invalidDto = new FinalMultipleExamCreateDTO
            {
                MultiExamName = "", // Rỗng
                NumberQuestion = 5,
                CreateAt = DateTime.Now.AddDays(1),
                TeacherId = teacherId,
                SubjectId = 1,
                SemesterId = 1,
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 1,
                        LevelQuestionId = 1,
                        NumberQuestion = 5
                    }
                }
            };

            // Act & Assert: Ném exception
            var exception = Assert.ThrowsAsync<Exception>(async () => 
                await _repository.CreateFinalMultipleExamAsync(invalidDto));
            exception.Message.Should().Contain("Tên kỳ thi không được để trống");
        }

        [Test]
        public async Task CreateFinalMultipleExamAsync_TestCase3_InvalidNumberQuestion_ThrowsException()
        {
            // Arrange: NumberQuestion không hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;
            var invalidDto = new FinalMultipleExamCreateDTO
            {
                MultiExamName = "Bài thi cuối kỳ 1",
                NumberQuestion = 0, // Nhỏ hơn hoặc bằng 0
                CreateAt = DateTime.Now.AddDays(1),
                TeacherId = teacherId,
                SubjectId = 1,
                SemesterId = 1,
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 1,
                        LevelQuestionId = 1,
                        NumberQuestion = 5
                    }
                }
            };

            // Act & Assert: Ném exception
            var exception = Assert.ThrowsAsync<Exception>(async () => 
                await _repository.CreateFinalMultipleExamAsync(invalidDto));
            exception.Message.Should().Contain("Số lượng câu hỏi phải lớn hơn 0");
        }

        [Test]
        public async Task CreateFinalMultipleExamAsync_TestCase4_InvalidCreateAtNull_ThrowsException()
        {
            // Arrange: CreateAt null
            var teacherId = _context.Teachers.First().TeacherId;
            var invalidDto = new FinalMultipleExamCreateDTO
            {
                MultiExamName = "Bài thi cuối kỳ 1",
                NumberQuestion = 5,
                CreateAt = default(DateTime), // Null
                TeacherId = teacherId,
                SubjectId = 1,
                SemesterId = 1,
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 1,
                        LevelQuestionId = 1,
                        NumberQuestion = 5
                    }
                }
            };

            // Act & Assert: Ném exception
            var exception = Assert.ThrowsAsync<Exception>(async () => 
                await _repository.CreateFinalMultipleExamAsync(invalidDto));
            exception.Message.Should().Contain("Ngày tạo không được để trống");
        }

        

        [Test]
        public async Task CreateFinalMultipleExamAsync_TestCase6_InvalidTeacherId_ThrowsException()
        {
            // Arrange: TeacherId không hợp lệ
            var invalidDto = new FinalMultipleExamCreateDTO
            {
                MultiExamName = "Bài thi cuối kỳ 1",
                NumberQuestion = 5,
                CreateAt = DateTime.Now.AddDays(1),
                TeacherId = Guid.NewGuid(), // Không tồn tại
                SubjectId = 1,
                SemesterId = 1,
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 1,
                        LevelQuestionId = 1,
                        NumberQuestion = 5
                    }
                }
            };

            // Act & Assert: Ném exception
            var exception = Assert.ThrowsAsync<Exception>(async () => 
                await _repository.CreateFinalMultipleExamAsync(invalidDto));
            exception.Message.Should().Contain("Giáo viên không tồn tại");
        }

        [Test]
        public async Task CreateFinalMultipleExamAsync_TestCase7_InvalidSubjectId_ThrowsException()
        {
            // Arrange: SubjectId không hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;
            var invalidDto = new FinalMultipleExamCreateDTO
            {
                MultiExamName = "Bài thi cuối kỳ 1",
                NumberQuestion = 5,
                CreateAt = DateTime.Now.AddDays(1),
                TeacherId = teacherId,
                SubjectId = 999, // Không tồn tại
                SemesterId = 1,
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 1,
                        LevelQuestionId = 1,
                        NumberQuestion = 5
                    }
                }
            };

            // Act & Assert: Ném exception
            var exception = Assert.ThrowsAsync<Exception>(async () => 
                await _repository.CreateFinalMultipleExamAsync(invalidDto));
            exception.Message.Should().Contain("Môn học không tồn tại");
        }

        [Test]
        public async Task CreateFinalMultipleExamAsync_TestCase8_InvalidSemesterId_ThrowsException()
        {
            // Arrange: SemesterId không hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;
            var invalidDto = new FinalMultipleExamCreateDTO
            {
                MultiExamName = "Bài thi cuối kỳ 1",
                NumberQuestion = 5,
                CreateAt = DateTime.Now.AddDays(1),
                TeacherId = teacherId,
                SubjectId = 1,
                SemesterId = 999, // Không tồn tại
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 1,
                        LevelQuestionId = 1,
                        NumberQuestion = 5
                    }
                }
            };

            // Act & Assert: Ném exception
            var exception = Assert.ThrowsAsync<Exception>(async () => 
                await _repository.CreateFinalMultipleExamAsync(invalidDto));
            exception.Message.Should().Contain("Học kỳ không tồn tại");
        }

        [Test]
        public async Task CreateFinalMultipleExamAsync_TestCase9_InvalidNoQuestionNumber_ThrowsException()
        {
            // Arrange: NumberQuestion trong NoQuestionInChapterDTO nhỏ hơn 0
            var teacherId = _context.Teachers.First().TeacherId;
            var invalidDto = new FinalMultipleExamCreateDTO
            {
                MultiExamName = "Bài thi cuối kỳ 1",
                NumberQuestion = 5,
                CreateAt = DateTime.Now.AddDays(1),
                TeacherId = teacherId,
                SubjectId = 1,
                SemesterId = 1,
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 1,
                        LevelQuestionId = 1,
                        NumberQuestion = -1 // Nhỏ hơn 0
                    }
                }
            };

            // Act & Assert: Ném exception
            var exception = Assert.ThrowsAsync<Exception>(async () => 
                await _repository.CreateFinalMultipleExamAsync(invalidDto));
            exception.Message.Should().Contain("Số lượng câu hỏi trong chương 1 phải lớn hơn 0");
        }

        [Test]
        public async Task CreateFinalMultipleExamAsync_TestCase10_InvalidChapterId_ThrowsException()
        {
            // Arrange: ChapterId không hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;
            var invalidDto = new FinalMultipleExamCreateDTO
            {
                MultiExamName = "Bài thi cuối kỳ 1",
                NumberQuestion = 5,
                CreateAt = DateTime.Now.AddDays(1),
                TeacherId = teacherId,
                SubjectId = 1,
                SemesterId = 1,
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 999, // Không tồn tại
                        LevelQuestionId = 1,
                        NumberQuestion = 5
                    }
                }
            };

            // Act & Assert: Ném exception
            var exception = Assert.ThrowsAsync<Exception>(async () => 
                await _repository.CreateFinalMultipleExamAsync(invalidDto));
            exception.Message.Should().Contain("Chương 999 không tồn tại");
        }

        [Test]
        public async Task CreateFinalMultipleExamAsync_TestCase11_InvalidLevelQuestionId_ThrowsException()
        {
            // Arrange: LevelQuestionId không hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;
            var invalidDto = new FinalMultipleExamCreateDTO
            {
                MultiExamName = "Bài thi cuối kỳ 1",
                NumberQuestion = 5,
                CreateAt = DateTime.Now.AddDays(1),
                TeacherId = teacherId,
                SubjectId = 1,
                SemesterId = 1,
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 1,
                        LevelQuestionId = 999, // Không tồn tại
                        NumberQuestion = 5
                    }
                }
            };

            // Act & Assert: Ném exception
            var exception = Assert.ThrowsAsync<Exception>(async () => 
                await _repository.CreateFinalMultipleExamAsync(invalidDto));
            exception.Message.Should().Contain("Cấp độ câu hỏi 999 không tồn tại");
        }

        [Test]
        public async Task CreateFinalMultipleExamAsync_TestCase12_InvalidNumberQuestionExceedsAvailable_ThrowsException()
        {
            // Arrange: Số lượng câu hỏi vượt quá số lượng có sẵn
            var teacherId = _context.Teachers.First().TeacherId;
            var invalidDto = new FinalMultipleExamCreateDTO
            {
                MultiExamName = "Bài thi cuối kỳ 1",
                NumberQuestion = 5,
                CreateAt = DateTime.Now.AddDays(1),
                TeacherId = teacherId,
                SubjectId = 1,
                SemesterId = 1,
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 1,
                        LevelQuestionId = 1,
                        NumberQuestion = 15 // Vượt quá số lượng có sẵn (10)
                    }
                }
            };

            // Act & Assert: Ném exception
            var exception = Assert.ThrowsAsync<Exception>(async () => 
                await _repository.CreateFinalMultipleExamAsync(invalidDto));
            exception.Message.Should().Contain("Số lượng câu hỏi yêu cầu (15) vượt quá số lượng câu hỏi có sẵn (10)");
        }

        [Test]
        public async Task CreateFinalMultipleExamAsync_TestCase13_InvalidTotalNumberQuestionMismatch_ThrowsException()
        {
            // Arrange: Tổng số câu hỏi không khớp với NumberQuestion
            var teacherId = _context.Teachers.First().TeacherId;
            var invalidDto = new FinalMultipleExamCreateDTO
            {
                MultiExamName = "Bài thi cuối kỳ 1",
                NumberQuestion = 10, // Tổng số câu hỏi của kỳ thi
                CreateAt = DateTime.Now.AddDays(1),
                TeacherId = teacherId,
                SubjectId = 1,
                SemesterId = 1,
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 1,
                        LevelQuestionId = 1,
                        NumberQuestion = 5 // Chỉ 5 câu hỏi, không khớp với 10
                    }
                }
            };

            // Act & Assert: Ném exception
            var exception = Assert.ThrowsAsync<Exception>(async () => 
                await _repository.CreateFinalMultipleExamAsync(invalidDto));
            exception.Message.Should().Contain("Tổng số câu hỏi trong danh sách (5) phải bằng số lượng câu hỏi của kỳ thi (10)");
        }

        [Test]
        public async Task CreateFinalMultipleExamAsync_TestCase14_DuplicateExamNameInSameSemester_ThrowsException()
        {
            // Arrange: Tạo kỳ thi đầu tiên
            var teacherId = _context.Teachers.First().TeacherId;
            var firstExamDto = new FinalMultipleExamCreateDTO
            {
                MultiExamName = "Bài thi cuối kỳ Web",
                NumberQuestion = 5,
                CreateAt = DateTime.Now.AddDays(1),
                TeacherId = teacherId,
                SubjectId = 1,
                SemesterId = 1,
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 1,
                        LevelQuestionId = 1,
                        NumberQuestion = 5
                    }
                }
            };

            // Tạo kỳ thi đầu tiên
            await _repository.CreateFinalMultipleExamAsync(firstExamDto);

            // Tạo kỳ thi thứ hai với cùng tên trong cùng học kỳ
            var duplicateExamDto = new FinalMultipleExamCreateDTO
            {
                MultiExamName = "Bài thi cuối kỳ Web", // Cùng tên
                NumberQuestion = 5,
                CreateAt = DateTime.Now.AddDays(2), // Cùng năm
                TeacherId = teacherId,
                SubjectId = 1,
                SemesterId = 1, // Cùng học kỳ
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 1,
                        LevelQuestionId = 1,
                        NumberQuestion = 5
                    }
                }
            };

            // Act & Assert: Ném exception khi tạo kỳ thi trùng tên
            var exception = Assert.ThrowsAsync<Exception>(async () => 
                await _repository.CreateFinalMultipleExamAsync(duplicateExamDto));
            exception.Message.Should().Be("Đã tồn tại kỳ thi với tên 'Bài thi cuối kỳ Web' trong học kỳ này!");
        }

        [Test]
        public async Task CreateFinalMultipleExamAsync_TestCase15_DuplicateExamNameInDifferentSemester_Success()
        {
            // Arrange: Tạo kỳ thi đầu tiên
            var teacherId = _context.Teachers.First().TeacherId;
            var firstExamDto = new FinalMultipleExamCreateDTO
            {
                MultiExamName = "Bài thi cuối kỳ Web",
                NumberQuestion = 5,
                CreateAt = DateTime.Now.AddDays(1),
                TeacherId = teacherId,
                SubjectId = 1,
                SemesterId = 1,
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 1,
                        LevelQuestionId = 1,
                        NumberQuestion = 5
                    }
                }
            };

            // Tạo kỳ thi đầu tiên
            await _repository.CreateFinalMultipleExamAsync(firstExamDto);

            // Tạo semester khác
            var differentSemester = new Semester
            {
                SemesterId = 2,
                SemesterName = "Học kỳ 2",
                IsActive = true
            };
            _context.Semesters.Add(differentSemester);
            await _context.SaveChangesAsync();

            // Tạo kỳ thi thứ hai với cùng tên nhưng khác học kỳ
            var duplicateExamDto = new FinalMultipleExamCreateDTO
            {
                MultiExamName = "Bài thi cuối kỳ Web", // Cùng tên
                NumberQuestion = 5,
                CreateAt = DateTime.Now.AddDays(2),
                TeacherId = teacherId,
                SubjectId = 1,
                SemesterId = 2, // Khác học kỳ
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 1,
                        LevelQuestionId = 1,
                        NumberQuestion = 5
                    }
                }
            };

            // Act: Tạo kỳ thi thứ hai
            var result = await _repository.CreateFinalMultipleExamAsync(duplicateExamDto);

            // Assert: Thành công vì khác học kỳ
            result.Should().NotBeNull();
            result.MultiExamName.Should().Be("Bài thi cuối kỳ Web");
            result.SemesterId.Should().Be(2);
        }
    }
} 