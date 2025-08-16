using FluentAssertions;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.MultipleQuestionDTO;
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
    public class ViewMultipleChoiceQuestionTests
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

            // Tạo Student
            var student = new Student
            {
                StudentId = Guid.NewGuid(),
                UserId = user.Id,
                User = user,
                EnrollDate = DateTime.UtcNow,
                AvatarURL = "default-avatar.jpg"
            };
            _context.Students.Add(student);

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

            // Tạo MultiAnswer cho câu hỏi 2
            var multiAnswer3 = new MultiAnswer
            {
                AnswerId = 3,
                AnswerContent = "Đáp án C",
                IsCorrect = true,
                MultiQuestionId = multiQuestion2.MultiQuestionId,
                MultiQuestion = multiQuestion2
            };
            _context.MultiAnswers.Add(multiAnswer3);

            var multiAnswer4 = new MultiAnswer
            {
                AnswerId = 4,
                AnswerContent = "Đáp án D",
                IsCorrect = false,
                MultiQuestionId = multiQuestion2.MultiQuestionId,
                MultiQuestion = multiQuestion2
            };
            _context.MultiAnswers.Add(multiAnswer4);

            // Tạo ExamSlotRoom
            var examSlotRoom = new ExamSlotRoom
            {
                ExamSlotRoomId = 1,
                ExamSlotId = 1,
                RoomId = 1,
                MultiOrPractice = "Multi",
                SubjectId = subject.SubjectId,
                SupervisorId = teacher.TeacherId,
                ExamDate = DateTime.Now.AddDays(1),
                SemesterId = semester.SemesterId
            };
            _context.ExamSlotRooms.Add(examSlotRoom);

            // Tạo MultiExam
            var multiExam = new MultiExam
            {
                MultiExamId = 1,
                MultiExamName = "Bài thi giữa kỳ",
                NumberQuestion = 2,
                StartDay = DateTime.UtcNow.AddDays(-1),
                EndDay = DateTime.UtcNow.AddDays(1),
                Duration = 60,
                Status = "Active",
                CodeStart = "123456",
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                SubjectId = subject.SubjectId,
                Subject = subject,
                CategoryExamId = categoryExam.CategoryExamId,
                CategoryExam = categoryExam,
                SemesterId = semester.SemesterId,
                Semester = semester,
                ClassId = classEntity.ClassId,
                Class = classEntity,
                CreateAt = DateTime.UtcNow,
                IsPublish = true
            };
            _context.MultiExams.Add(multiExam);

            // Tạo MultiExamHistory
            var multiExamHistory = new MultiExamHistory
            {
                ExamHistoryId = Guid.NewGuid(),
                StartTime = DateTime.UtcNow,
                EndTime = null,
                Score = null,
                CheckIn = true,
                StatusExam = "InProgress",
                IsGrade = false,
                ExamSlotRoomId = examSlotRoom.ExamSlotRoomId,
                ExamSlotRoom = examSlotRoom,
                MultiExamId = multiExam.MultiExamId,
                MultiExam = multiExam,
                StudentId = student.StudentId,
                Student = student
            };
            _context.MultiExamHistories.Add(multiExamHistory);

            // Tạo QuestionMultiExam
            var questionMultiExam1 = new QuestionMultiExam
            {
                MultiExamHistoryId = multiExamHistory.ExamHistoryId,
                MultiExamHistory = multiExamHistory,
                MultiQuestionId = multiQuestion1.MultiQuestionId,
                MultiQuestion = multiQuestion1,
                QuestionOrder = 1,
                Answer = "A",
                Score = 1.0
            };
            _context.QuestionMultiExams.Add(questionMultiExam1);

            var questionMultiExam2 = new QuestionMultiExam
            {
                MultiExamHistoryId = multiExamHistory.ExamHistoryId,
                MultiExamHistory = multiExamHistory,
                MultiQuestionId = multiQuestion2.MultiQuestionId,
                MultiQuestion = multiQuestion2,
                QuestionOrder = 2,
                Answer = "B",
                Score = 1.0
            };
            _context.QuestionMultiExams.Add(questionMultiExam2);

            _context.SaveChanges();
        }

        [Test]
        public async Task GetAllQuestionMultiExamByMultiExamIdAsync_ValidExamId_ReturnsQuestions()
        {
            // Arrange
            int validExamId = 1;

            // Act
            var result = await _multipleQuestionRepository.GetAllQuestionMultiExamByMultiExamIdAsync(validExamId);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().Contain(q => q.Id == 1 && q.QuestionOrder == 1);
            result.Should().Contain(q => q.Id == 2 && q.QuestionOrder == 2);
        }

        [Test]
        public async Task GetAllQuestionMultiExamByMultiExamIdAsync_InvalidExamId_ReturnsEmptyList()
        {
            // Arrange
            int invalidExamId = 999;

            // Act
            var result = await _multipleQuestionRepository.GetAllQuestionMultiExamByMultiExamIdAsync(invalidExamId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Test]
        public async Task GetAllQuestionMultiExamByMultiExamIdAsync_ExamWithNoQuestions_ReturnsEmptyList()
        {
            // Arrange
            // Tạo một MultiExam mới không có câu hỏi
            var newMultiExam = new MultiExam
            {
                MultiExamId = 2,
                MultiExamName = "Bài thi không có câu hỏi",
                NumberQuestion = 0,
                StartDay = DateTime.UtcNow.AddDays(-1),
                EndDay = DateTime.UtcNow.AddDays(1),
                Duration = 60,
                Status = "Active",
                CodeStart = "654321",
                TeacherId = _context.Teachers.First().TeacherId,
                Teacher = _context.Teachers.First(),
                SubjectId = _context.Subjects.First().SubjectId,
                Subject = _context.Subjects.First(),
                CategoryExamId = _context.CategoryExams.First().CategoryExamId,
                CategoryExam = _context.CategoryExams.First(),
                SemesterId = _context.Semesters.First().SemesterId,
                Semester = _context.Semesters.First(),
                ClassId = _context.Classes.First().ClassId,
                Class = _context.Classes.First(),
                CreateAt = DateTime.UtcNow,
                IsPublish = true
            };
            _context.MultiExams.Add(newMultiExam);
            await _context.SaveChangesAsync();

            // Act
            var result = await _multipleQuestionRepository.GetAllQuestionMultiExamByMultiExamIdAsync(2);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Test]
        public async Task GetAllQuestionMultiExamByMultiExamIdAsync_QuestionsOrderedCorrectly()
        {
            // Arrange
            int validExamId = 1;

            // Act
            var result = await _multipleQuestionRepository.GetAllQuestionMultiExamByMultiExamIdAsync(validExamId);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            
            // Kiểm tra thứ tự câu hỏi
            var orderedQuestions = result.OrderBy(q => q.QuestionOrder).ToList();
            orderedQuestions[0].QuestionOrder.Should().Be(1);
            orderedQuestions[1].QuestionOrder.Should().Be(2);
        }

        [Test]
        public async Task GetAllMultipleQuestionsAsync_ReturnsAllQuestions()
        {
            // Act
            var result = await _multipleQuestionRepository.GetAllMultipleQuestionsAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            
            var questions = result.ToList();
            questions.Should().Contain(q => q.Content == "Câu hỏi trắc nghiệm 1");
            questions.Should().Contain(q => q.Content == "Câu hỏi trắc nghiệm 2");
            questions.Should().Contain(q => q.ChapterName == "Chương 1: Giới thiệu");
            questions.Should().Contain(q => q.CategoryExamName == "Giữa kỳ");
            questions.Should().Contain(q => q.LevelQuestionName == "Dễ");
            questions.Should().Contain(q => q.SemesterName == "Học kỳ 1");
        }

        [Test]
        public async Task GetQuestionCountAsync_WithValidFilters_ReturnsCorrectCount()
        {
            // Arrange
            int? chapterId = 1;
            int? categoryId = 1;
            int? levelId = 1;
            bool? isPublic = true;
            Guid? createdBy = _context.Teachers.First().TeacherId;

            // Act
            var result = await _multipleQuestionRepository.GetQuestionCountAsync(chapterId, categoryId, levelId, isPublic, createdBy);

            // Assert
            result.Should().Be(2);
        }

        [Test]
        public async Task GetQuestionCountAsync_WithInvalidFilters_ReturnsZero()
        {
            // Arrange
            int? chapterId = 999; // Không tồn tại

            // Act
            var result = await _multipleQuestionRepository.GetQuestionCountAsync(chapterId, null, null, null, null);

            // Assert
            result.Should().Be(0);
        }

        [Test]
        public async Task GetQuestionCountAsync_WithNullFilters_ReturnsAllQuestions()
        {
            // Act
            var result = await _multipleQuestionRepository.GetQuestionCountAsync(null, null, null, null, null);

            // Assert
            result.Should().Be(2);
        }
    }
} 