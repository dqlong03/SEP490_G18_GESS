using FluentAssertions;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Implement;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace GESS.Test
{
    [TestFixture]
    public class DeleteMultipleChoiceQuestionTests
    {
        private GessDbContext _context;
        private MultipleQuestionRepository _multipleQuestionRepository;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<GessDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new GessDbContext(options);
            _multipleQuestionRepository = new MultipleQuestionRepository(_context);

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

            // Tạo MultiQuestion
            var multiQuestion1 = new MultiQuestion
            {
                MultiQuestionId = 1,
                Content = "Câu hỏi trắc nghiệm 1",
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
            _context.MultiQuestions.Add(multiQuestion1);

            var multiQuestion2 = new MultiQuestion
            {
                MultiQuestionId = 2,
                Content = "Câu hỏi trắc nghiệm 2",
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
            _context.MultiQuestions.Add(multiQuestion2);

            // Tạo MultiAnswer cho câu hỏi 1
            var multiAnswer1 = new MultiAnswer
            {
                AnswerId = 1,
                AnswerContent = "Đáp án A",
                IsCorrect = true,
                MultiQuestionId = multiQuestion1.MultiQuestionId,
                MultiQuestion = multiQuestion1
            };
            _context.MultiAnswers.Add(multiAnswer1);

            var multiAnswer2 = new MultiAnswer
            {
                AnswerId = 2,
                AnswerContent = "Đáp án B",
                IsCorrect = false,
                MultiQuestionId = multiQuestion1.MultiQuestionId,
                MultiQuestion = multiQuestion1
            };
            _context.MultiAnswers.Add(multiAnswer2);

            _context.SaveChanges();
        }

        [Test]
        public async Task Delete_ValidQuestionId_RemovesQuestion()
        {
            // Arrange
            int validQuestionId = 1;
            var questionBeforeDelete = await _context.MultiQuestions.FindAsync(validQuestionId);
            questionBeforeDelete.Should().NotBeNull();

            // Act
            _multipleQuestionRepository.Delete(validQuestionId);
            await _context.SaveChangesAsync();

            // Assert
            var questionAfterDelete = await _context.MultiQuestions.FindAsync(validQuestionId);
            questionAfterDelete.Should().BeNull();
        }

        [Test]
        public async Task Delete_InvalidQuestionId_DoesNothing()
        {
            // Arrange
            int invalidQuestionId = 999;
            var initialCount = _context.MultiQuestions.Count();

            // Act
            _multipleQuestionRepository.Delete(invalidQuestionId);
            await _context.SaveChangesAsync();

            // Assert
            var finalCount = _context.MultiQuestions.Count();
            finalCount.Should().Be(initialCount);
        }

        [Test]
        public async Task Delete_QuestionWithRelatedData_RemovesQuestion()
        {
            // Arrange
            int questionId = 1;
            var question = await _context.MultiQuestions.FindAsync(questionId);
            var relatedAnswers = _context.MultiAnswers.Where(a => a.MultiQuestionId == questionId).ToList();
            relatedAnswers.Should().HaveCount(2); // Có 2 đáp án

            // Act
            _multipleQuestionRepository.Delete(questionId);
            await _context.SaveChangesAsync();

            // Assert
            var deletedQuestion = await _context.MultiQuestions.FindAsync(questionId);
            deletedQuestion.Should().BeNull();
            
            // Kiểm tra related data cũng bị xóa (nếu có cascade delete)
            var remainingAnswers = _context.MultiAnswers.Where(a => a.MultiQuestionId == questionId).ToList();
            remainingAnswers.Should().BeEmpty();
        }

        [Test]
        public async Task Delete_QuestionInUse_ThrowsException()
        {
            // Arrange
            int questionId = 1;
            
            // Tạo QuestionMultiExam để liên kết với câu hỏi (mô phỏng câu hỏi đang được sử dụng)
            var questionMultiExam = new QuestionMultiExam
            {
                MultiExamHistoryId = Guid.NewGuid(),
                MultiQuestionId = questionId,
                QuestionOrder = 1,
                Answer = "A",
                Score = 1.0
            };
            _context.QuestionMultiExams.Add(questionMultiExam);
            await _context.SaveChangesAsync();

            // Act & Assert
            var action = () => 
            {
                _multipleQuestionRepository.Delete(questionId);
                _context.SaveChanges();
            };

            // Khi câu hỏi đang được sử dụng, sẽ throw exception do foreign key constraint
            action.Should().Throw<InvalidOperationException>()
                .WithMessage("*association between entity types*");
        }
    }
} 