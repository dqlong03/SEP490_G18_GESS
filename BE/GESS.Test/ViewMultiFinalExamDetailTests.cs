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
using System.Collections.Generic;

namespace GESS.Test
{
    [TestFixture]
    public class ViewMultiFinalExamDetailTests
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
                ChapterName = "Chương 1: HTML cơ bản",
                SubjectId = 1,
                Description = "Mô tả chương 1"
            };
            _context.Chapters.Add(chapter);

            var chapter2 = new Chapter
            {
                ChapterId = 2,
                ChapterName = "Chương 2: CSS cơ bản",
                SubjectId = 1,
                Description = "Mô tả chương 2"
            };
            _context.Chapters.Add(chapter2);

            // Tạo LevelQuestion
            var levelQuestion = new LevelQuestion
            {
                LevelQuestionId = 1,
                LevelQuestionName = "Dễ"
            };
            _context.LevelQuestions.Add(levelQuestion);

            var levelQuestion2 = new LevelQuestion
            {
                LevelQuestionId = 2,
                LevelQuestionName = "Trung bình"
            };
            _context.LevelQuestions.Add(levelQuestion2);

            // Tạo MultiExam
            var multiExam = new MultiExam
            {
                MultiExamId = 1,
                MultiExamName = "Bài thi cuối kỳ Web",
                NumberQuestion = 10,
                SubjectId = 1,
                Duration = 60,
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(7).AddHours(1),
                CategoryExamId = 2, // Final exam
                SemesterId = 1,
                TeacherId = teacher.TeacherId,
                CreateAt = DateTime.Now,
                IsPublish = true,
                ClassId = 1
            };
            _context.MultiExams.Add(multiExam);

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
                    ChapterId = i <= 5 ? 1 : 2, // 5 câu chương 1, 5 câu chương 2
                    CategoryExamId = 1,
                    LevelQuestionId = i <= 7 ? 1 : 2, // 7 câu dễ, 3 câu trung bình
                    SemesterId = 1,
                    CreateAt = DateTime.Now
                };
                _context.MultiQuestions.Add(multiQuestion);
            }

            // Tạo NoQuestionInChapter
            var noQuestionInChapter1 = new NoQuestionInChapter
            {
                MultiExamId = 1,
                ChapterId = 1,
                LevelQuestionId = 1,
                NumberQuestion = 5
            };
            _context.NoQuestionInChapters.Add(noQuestionInChapter1);

            var noQuestionInChapter2 = new NoQuestionInChapter
            {
                MultiExamId = 1,
                ChapterId = 2,
                LevelQuestionId = 2,
                NumberQuestion = 5
            };
            _context.NoQuestionInChapters.Add(noQuestionInChapter2);

            // Tạo FinalExam (liên kết MultiExam với MultiQuestion)
            for (int i = 1; i <= 10; i++)
            {
                var finalExam = new FinalExam
                {
                    MultiExamId = 1,
                    MultiQuestionId = i
                };
                _context.FinalExam.Add(finalExam);
            }

            _context.SaveChanges();
        }

        [Test]
        public async Task ViewMultiFinalExamDetail_TestCase1_ValidExamId_ReturnsExamDetail()
        {
            // Arrange
            var validExamId = 1;

            // Act
            var result = await _repository.ViewMultiFinalExamDetail(validExamId);

            // Assert
            result.Should().NotBeNull();
            result.MultiExamId.Should().Be(1);
            result.MultiExamName.Should().Be("Bài thi cuối kỳ Web");
            result.SubjectName.Should().Be("Lập trình Web");
            result.SemesterName.Should().Be("Học kỳ 1");
            result.TeacherId.Should().NotBeEmpty();
            result.TeacherName.Should().Be("Giáo viên 1");

            // Kiểm tra NoQuestionInChapterDTO
            result.NoQuestionInChapterDTO.Should().NotBeNull();
            result.NoQuestionInChapterDTO.Should().HaveCount(2);

            // Kiểm tra chi tiết từng NoQuestionInChapter
            var firstNoQuestion = result.NoQuestionInChapterDTO.FirstOrDefault(nq => nq.ChapterId == 1);
            firstNoQuestion.Should().NotBeNull();
            firstNoQuestion.ChapterId.Should().Be(1);
            firstNoQuestion.LevelQuestionId.Should().Be(1);
            firstNoQuestion.NumberQuestion.Should().Be(5);
            firstNoQuestion.ChapterName.Should().Be("Chương 1: HTML cơ bản");
            firstNoQuestion.LevelName.Should().Be("Dễ");

            var secondNoQuestion = result.NoQuestionInChapterDTO.FirstOrDefault(nq => nq.ChapterId == 2);
            secondNoQuestion.Should().NotBeNull();
            secondNoQuestion.ChapterId.Should().Be(2);
            secondNoQuestion.LevelQuestionId.Should().Be(2);
            secondNoQuestion.NumberQuestion.Should().Be(5);
            secondNoQuestion.ChapterName.Should().Be("Chương 2: CSS cơ bản");
            secondNoQuestion.LevelName.Should().Be("Trung bình");
        }

        [Test]
        public async Task ViewMultiFinalExamDetail_TestCase2_InvalidExamId_ThrowsException()
        {
            // Arrange
            var invalidExamId = 999; // Không tồn tại

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.ViewMultiFinalExamDetail(invalidExamId));
            exception.Message.Should().Be("Multiple exam not found.");
        }

        [Test]
        public async Task ViewMultiFinalExamDetail_TestCase3_ExamIdZero_ThrowsException()
        {
            // Arrange
            var invalidExamId = 0;

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.ViewMultiFinalExamDetail(invalidExamId));
            exception.Message.Should().Be("Multiple exam not found.");
        }

        [Test]
        public async Task ViewMultiFinalExamDetail_TestCase4_NegativeExamId_ThrowsException()
        {
            // Arrange
            var invalidExamId = -1;

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.ViewMultiFinalExamDetail(invalidExamId));
            exception.Message.Should().Be("Multiple exam not found.");
        }

        [Test]
        public async Task ViewMultiFinalExamDetail_TestCase5_ExamWithNoQuestions_ReturnsEmptyNoQuestionInChapterDTO()
        {
            // Arrange: Tạo một exam mới không có câu hỏi
            var teacher = await _context.Teachers.FirstAsync();
            var multiExamWithoutQuestions = new MultiExam
            {
                MultiExamId = 2,
                MultiExamName = "Bài thi không có câu hỏi",
                NumberQuestion = 0,
                SubjectId = 1,
                Duration = 60,
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(7).AddHours(1),
                CategoryExamId = 2,
                SemesterId = 1,
                TeacherId = teacher.TeacherId,
                CreateAt = DateTime.Now,
                IsPublish = true,
                ClassId = 1
            };
            _context.MultiExams.Add(multiExamWithoutQuestions);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.ViewMultiFinalExamDetail(2);

            // Assert
            result.Should().NotBeNull();
            result.MultiExamId.Should().Be(2);
            result.MultiExamName.Should().Be("Bài thi không có câu hỏi");
            result.NoQuestionInChapterDTO.Should().NotBeNull();
            result.NoQuestionInChapterDTO.Should().BeEmpty();
        }

        [Test]
        public async Task ViewMultiFinalExamDetail_TestCase6_ExamWithMultipleChaptersAndLevels_ReturnsCorrectData()
        {
            // Arrange: Tạo thêm chapter và level mới
            var chapter3 = new Chapter
            {
                ChapterId = 3,
                ChapterName = "Chương 3: JavaScript cơ bản",
                SubjectId = 1,
                Description = "Mô tả chương 3"
            };
            _context.Chapters.Add(chapter3);

            var levelQuestion3 = new LevelQuestion
            {
                LevelQuestionId = 3,
                LevelQuestionName = "Khó"
            };
            _context.LevelQuestions.Add(levelQuestion3);

            // Tạo exam mới với nhiều chapter và level
            var teacher = await _context.Teachers.FirstAsync();
            var complexExam = new MultiExam
            {
                MultiExamId = 3,
                MultiExamName = "Bài thi phức tạp",
                NumberQuestion = 15,
                SubjectId = 1,
                Duration = 90,
                StartDay = DateTime.Now.AddDays(14),
                EndDay = DateTime.Now.AddDays(14).AddHours(1.5),
                CategoryExamId = 2,
                SemesterId = 1,
                TeacherId = teacher.TeacherId,
                CreateAt = DateTime.Now,
                IsPublish = true,
                ClassId = 1
            };
            _context.MultiExams.Add(complexExam);

            // Tạo NoQuestionInChapter cho exam phức tạp
            var noQuestionInChapter3 = new NoQuestionInChapter
            {
                MultiExamId = 3,
                ChapterId = 1,
                LevelQuestionId = 1,
                NumberQuestion = 5
            };
            _context.NoQuestionInChapters.Add(noQuestionInChapter3);

            var noQuestionInChapter4 = new NoQuestionInChapter
            {
                MultiExamId = 3,
                ChapterId = 2,
                LevelQuestionId = 2,
                NumberQuestion = 5
            };
            _context.NoQuestionInChapters.Add(noQuestionInChapter4);

            var noQuestionInChapter5 = new NoQuestionInChapter
            {
                MultiExamId = 3,
                ChapterId = 3,
                LevelQuestionId = 3,
                NumberQuestion = 5
            };
            _context.NoQuestionInChapters.Add(noQuestionInChapter5);

            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.ViewMultiFinalExamDetail(3);

            // Assert
            result.Should().NotBeNull();
            result.MultiExamId.Should().Be(3);
            result.MultiExamName.Should().Be("Bài thi phức tạp");
            result.NoQuestionInChapterDTO.Should().HaveCount(3);

            // Kiểm tra từng NoQuestionInChapter
            var chapter1Question = result.NoQuestionInChapterDTO.FirstOrDefault(nq => nq.ChapterId == 1);
            chapter1Question.Should().NotBeNull();
            chapter1Question.ChapterName.Should().Be("Chương 1: HTML cơ bản");
            chapter1Question.LevelName.Should().Be("Dễ");

            var chapter2Question = result.NoQuestionInChapterDTO.FirstOrDefault(nq => nq.ChapterId == 2);
            chapter2Question.Should().NotBeNull();
            chapter2Question.ChapterName.Should().Be("Chương 2: CSS cơ bản");
            chapter2Question.LevelName.Should().Be("Trung bình");

            var chapter3Question = result.NoQuestionInChapterDTO.FirstOrDefault(nq => nq.ChapterId == 3);
            chapter3Question.Should().NotBeNull();
            chapter3Question.ChapterName.Should().Be("Chương 3: JavaScript cơ bản");
            chapter3Question.LevelName.Should().Be("Khó");
        }
    }
} 