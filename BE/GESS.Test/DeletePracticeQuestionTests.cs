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
    public class DeletePracticeQuestionTests
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

            var practiceQuestion3 = new PracticeQuestion
            {
                PracticeQuestionId = 3,
                Content = "Câu hỏi tự luận 3",
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
            _context.PracticeQuestions.Add(practiceQuestion3);

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

            // Tạo PracticeAnswer cho câu hỏi 3
            var practiceAnswer3 = new PracticeAnswer
            {
                AnswerId = 3,
                AnswerContent = "Đáp án cho câu hỏi tự luận 3",
                PracticeQuestionId = practiceQuestion3.PracticeQuestionId,
                PracticeQuestion = practiceQuestion3
            };
            _context.PracticeAnswers.Add(practiceAnswer3);

            _context.SaveChanges();
        }

        [Test]
        public async Task Delete_ValidQuestionId_RemovesQuestion()
        {
            // Arrange
            int validQuestionId = 1;
            var questionBeforeDelete = await _context.PracticeQuestions.FindAsync(validQuestionId);
            questionBeforeDelete.Should().NotBeNull();

            // Act
            _practiceQuestionRepository.Delete(validQuestionId);
            await _context.SaveChangesAsync();

            // Assert
            var questionAfterDelete = await _context.PracticeQuestions.FindAsync(validQuestionId);
            questionAfterDelete.Should().BeNull();
        }

        [Test]
        public async Task Delete_InvalidQuestionId_DoesNothing()
        {
            // Arrange
            int invalidQuestionId = 999;
            var initialCount = _context.PracticeQuestions.Count();

            // Act
            _practiceQuestionRepository.Delete(invalidQuestionId);
            await _context.SaveChangesAsync();

            // Assert
            var finalCount = _context.PracticeQuestions.Count();
            finalCount.Should().Be(initialCount);
        }

        [Test]
        public async Task Delete_QuestionWithRelatedData_RemovesQuestion()
        {
            // Arrange
            int questionId = 1;
            var question = await _context.PracticeQuestions.FindAsync(questionId);
            var relatedAnswer = _context.PracticeAnswers.FirstOrDefault(a => a.PracticeQuestionId == questionId);
            relatedAnswer.Should().NotBeNull();

            // Act
            _practiceQuestionRepository.Delete(questionId);
            await _context.SaveChangesAsync();

            // Assert
            var deletedQuestion = await _context.PracticeQuestions.FindAsync(questionId);
            deletedQuestion.Should().BeNull();
            
            // Kiểm tra related data cũng bị xóa (nếu có cascade delete)
            var remainingAnswer = _context.PracticeAnswers.FirstOrDefault(a => a.PracticeQuestionId == questionId);
            remainingAnswer.Should().BeNull();
        }

        [Test]
        public async Task Delete_QuestionInUse_ThrowsException()
        {
            // Arrange
            int questionId = 1;
            
            // Tạo QuestionPracExam để liên kết với câu hỏi (mô phỏng câu hỏi đang được sử dụng)
            var questionPracExam = new QuestionPracExam
            {
                PracExamHistoryId = Guid.NewGuid(),
                PracticeQuestionId = questionId,
                Answer = "Đáp án mẫu",
                Score = 1.0
            };
            _context.QuestionPracExams.Add(questionPracExam);
            await _context.SaveChangesAsync();

            // Act & Assert
            var action = () => 
            {
                _practiceQuestionRepository.Delete(questionId);
                _context.SaveChanges();
            };

            // Khi câu hỏi đang được sử dụng, sẽ throw exception do foreign key constraint
            action.Should().Throw<InvalidOperationException>()
                .WithMessage("*association between entity types*");
        }

        [Test]
        public async Task Delete_MultipleQuestions_RemovesAllQuestions()
        {
            // Arrange
            int questionId1 = 1;
            int questionId2 = 2;
            var initialCount = _context.PracticeQuestions.Count();
            initialCount.Should().Be(3); // Có 3 câu hỏi ban đầu

            // Act
            _practiceQuestionRepository.Delete(questionId1);
            _practiceQuestionRepository.Delete(questionId2);
            await _context.SaveChangesAsync();

            // Assert
            var finalCount = _context.PracticeQuestions.Count();
            finalCount.Should().Be(1); // Còn lại 1 câu hỏi

            var remainingQuestion = await _context.PracticeQuestions.FindAsync(3);
            remainingQuestion.Should().NotBeNull();
            remainingQuestion.Content.Should().Be("Câu hỏi tự luận 3");
        }
    }
} 