using FluentAssertions;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.PracticeQuestionDTO;
using GESS.Repository.Implement;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GESS.Test
{
    [TestFixture]
    public class ViewPracticeQuestionTests
    {
        private GessDbContext _context;
        private PracticeQuestionsRepository _practiceQuestionRepository;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<GessDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new GessDbContext(options);
            _practiceQuestionRepository = new PracticeQuestionsRepository(_context);

            SeedTestData();
        }

        [TearDown]
        public void TearDown()
        {
            _context.Dispose();
        }

        private void SeedTestData()
        {
            // Tạo User
            var user = new User
            {
                Id = Guid.NewGuid(),
                UserName = "testuser",
                Email = "test@example.com",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                TwoFactorEnabled = false,
                LockoutEnabled = false,
                AccessFailedCount = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true,
                Fullname = "Test User"
            };
            _context.Users.Add(user);

            // Tạo Teacher
            var teacher = new Teacher
            {
                TeacherId = Guid.NewGuid(),
                UserId = user.Id,
                User = user,
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
                SubjectName = "Lập trình web",
                Description = "Môn học về lập trình web",
                Course = "WEB101",
                NoCredits = 3
            };
            _context.Subjects.Add(subject);

            // Tạo CategoryExam
            var categoryExam = new CategoryExam
            {
                CategoryExamId = 1,
                CategoryExamName = "Giữa kỳ"
            };
            _context.CategoryExams.Add(categoryExam);

            // Tạo Semester
            var semester = new Semester
            {
                SemesterId = 1,
                SemesterName = "Học kỳ 1",
                IsActive = true
            };
            _context.Semesters.Add(semester);

            // Tạo Class
            var classEntity = new Class
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
            _context.Classes.Add(classEntity);

            // Tạo LevelQuestion
            var levelQuestion = new LevelQuestion
            {
                LevelQuestionId = 1,
                LevelQuestionName = "Dễ",
                Score = 1.0
            };
            _context.LevelQuestions.Add(levelQuestion);

            // Tạo Chapter
            var chapter = new Chapter
            {
                ChapterId = 1,
                ChapterName = "Chương 1: Giới thiệu",
                SubjectId = subject.SubjectId,
                Subject = subject,
                Description = "Chương giới thiệu"
            };
            _context.Chapters.Add(chapter);

            // Tạo Chapter khác (không có câu hỏi)
            var emptyChapter = new Chapter
            {
                ChapterId = 2,
                ChapterName = "Chương 2: Không có câu hỏi",
                SubjectId = subject.SubjectId,
                Subject = subject,
                Description = "Chương không có câu hỏi"
            };
            _context.Chapters.Add(emptyChapter);

            // Tạo PracticeQuestion
            var practiceQuestion1 = new PracticeQuestion
            {
                PracticeQuestionId = 1,
                Content = "Câu hỏi tự luận 1",
                UrlImg = null,
                IsActive = true,
                CreatedBy = teacher.TeacherId,
                IsPublic = true,
                ChapterId = chapter.ChapterId,
                Chapter = chapter,
                CategoryExamId = categoryExam.CategoryExamId,
                CategoryExam = categoryExam,
                LevelQuestionId = levelQuestion.LevelQuestionId,
                LevelQuestion = levelQuestion,
                SemesterId = semester.SemesterId,
                Semester = semester,
                CreateAt = DateTime.UtcNow
            };
            _context.PracticeQuestions.Add(practiceQuestion1);

            var practiceQuestion2 = new PracticeQuestion
            {
                PracticeQuestionId = 2,
                Content = "Câu hỏi tự luận 2",
                UrlImg = null,
                IsActive = true,
                CreatedBy = teacher.TeacherId,
                IsPublic = true,
                ChapterId = chapter.ChapterId,
                Chapter = chapter,
                CategoryExamId = categoryExam.CategoryExamId,
                CategoryExam = categoryExam,
                LevelQuestionId = levelQuestion.LevelQuestionId,
                LevelQuestion = levelQuestion,
                SemesterId = semester.SemesterId,
                Semester = semester,
                CreateAt = DateTime.UtcNow
            };
            _context.PracticeQuestions.Add(practiceQuestion2);

            // Tạo PracticeAnswer cho câu hỏi 1
            var practiceAnswer1 = new PracticeAnswer
            {
                AnswerId = 1,
                AnswerContent = "Đáp án cho câu hỏi tự luận 1",
                PracticeQuestionId = practiceQuestion1.PracticeQuestionId,
                PracticeQuestion = practiceQuestion1
            };
            _context.PracticeAnswers.Add(practiceAnswer1);

            // Tạo PracticeAnswer cho câu hỏi 2
            var practiceAnswer2 = new PracticeAnswer
            {
                AnswerId = 2,
                AnswerContent = "Đáp án cho câu hỏi tự luận 2",
                PracticeQuestionId = practiceQuestion2.PracticeQuestionId,
                PracticeQuestion = practiceQuestion2
            };
            _context.PracticeAnswers.Add(practiceAnswer2);

            _context.SaveChanges();
        }

        [Test]
        public async Task GetAllPracticeQuestionsAsync_ValidChapterId_ReturnsQuestions()
        {
            // Arrange
            int validChapterId = 1;

            // Act
            var result = await _practiceQuestionRepository.GetAllPracticeQuestionsAsync(validChapterId);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().Contain(q => q.Content == "Câu hỏi tự luận 1");
            result.Should().Contain(q => q.Content == "Câu hỏi tự luận 2");
        }

        [Test]
        public async Task GetAllPracticeQuestionsAsync_InvalidChapterId_ReturnsEmptyList()
        {
            // Arrange
            int invalidChapterId = 999;

            // Act
            var result = await _practiceQuestionRepository.GetAllPracticeQuestionsAsync(invalidChapterId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Test]
        public async Task GetAllPracticeQuestionsAsync_ChapterWithNoQuestions_ReturnsEmptyList()
        {
            // Arrange
            int emptyChapterId = 2; // Chapter không có câu hỏi

            // Act
            var result = await _practiceQuestionRepository.GetAllPracticeQuestionsAsync(emptyChapterId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Test]
        public async Task GetAllPracticeQuestionsAsync_WithNullPracticeAnswer_ReturnsQuestions()
        {
            // Arrange
            int validChapterId = 1;
            // Xóa PracticeAnswer của một câu hỏi để mô phỏng null
            var practiceQuestion = await _context.PracticeQuestions.FirstAsync(q => q.ChapterId == validChapterId);
            var practiceAnswer = await _context.PracticeAnswers.FirstAsync(a => a.PracticeQuestionId == practiceQuestion.PracticeQuestionId);
            _context.PracticeAnswers.Remove(practiceAnswer);
            await _context.SaveChangesAsync();

            // Act
            var result = await _practiceQuestionRepository.GetAllPracticeQuestionsAsync(validChapterId);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2); // Vẫn trả về 2 câu hỏi
            var questions = result.ToList();
            questions.Should().Contain(q => q.Content == "Câu hỏi tự luận 1" && q.UrlImg == null); // Kiểm tra câu hỏi có PracticeAnswer bị xóa
            questions.Should().Contain(q => q.Content == "Câu hỏi tự luận 2"); // Kiểm tra câu hỏi còn lại
        }
    }
} 