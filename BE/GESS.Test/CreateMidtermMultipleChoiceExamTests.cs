using FluentAssertions;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.MultipleExam;
using GESS.Model.NoQuestionInChapter;
using GESS.Model.Student;
using GESS.Repository.Implement;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GESS.Test
{
    [TestFixture]
    public class CreateMidtermMultipleChoiceExamTests
    {
        private GessDbContext _context;
        private MultipleExamRepository _repository;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<GessDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            _context = new GessDbContext(options);
            _repository = new MultipleExamRepository(_context);
            SeedTestData();
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

            // Seed CategoryExam (Midterm)
            var categoryExam = new CategoryExam
            {
                CategoryExamId = 1,
                CategoryExamName = "Giữa kỳ"
            };
            _context.CategoryExams.Add(categoryExam);

            // Seed LevelQuestion
            var levelQuestion = new LevelQuestion
            {
                LevelQuestionId = 1,
                LevelQuestionName = "Dễ",
                Score = 1.0
            };
            _context.LevelQuestions.Add(levelQuestion);

            // Seed Chapters
            var chapter = new Chapter
            {
                ChapterId = 1,
                ChapterName = "Chương 1: Giới thiệu",
                Description = "Chương giới thiệu về lập trình web",
                SubjectId = 1,
                Subject = subject
            };
            _context.Chapters.Add(chapter);

            // Seed Classes
            var classEntity = new Class
            {
                ClassId = 1,
                ClassName = "Lớp CNTT1",
                TeacherId = teacher.TeacherId,
                SubjectId = 1,
                SemesterId = 1,
                CreatedDate = DateTime.UtcNow
            };
            _context.Classes.Add(classEntity);

            // Seed Students
            var student = new Student
            {
                StudentId = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                User = new User
                {
                    Id = Guid.NewGuid(),
                    Email = "student@test.com",
                    UserName = "student@test.com",
                    Fullname = "Sinh viên test",
                    EmailConfirmed = true,
                    PhoneNumberConfirmed = true,
                    TwoFactorEnabled = false,
                    LockoutEnabled = true,
                    AccessFailedCount = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsActive = true
                },
                EnrollDate = DateTime.UtcNow,
                AvatarURL = "https://example.com/avatar.jpg"
            };
            _context.Students.Add(student);

            // Seed MultiQuestions
            for (int i = 1; i <= 10; i++)
            {
                var multiQuestion = new MultiQuestion
                {
                    MultiQuestionId = i,
                    Content = $"Câu hỏi trắc nghiệm {i}",
                    UrlImg = null,
                    IsActive = true,
                    CreatedBy = teacher.TeacherId,
                    IsPublic = true,
                    ChapterId = 1,
                    Chapter = chapter,
                    CategoryExamId = 1,
                    CategoryExam = categoryExam,
                    LevelQuestionId = 1,
                    LevelQuestion = levelQuestion,
                    SemesterId = 1,
                    Semester = semester,
                    CreateAt = DateTime.UtcNow
                };
                _context.MultiQuestions.Add(multiQuestion);

                // Seed MultiAnswers for each question
                for (int j = 1; j <= 4; j++)
                {
                    var multiAnswer = new MultiAnswer
                    {
                        AnswerId = (i - 1) * 4 + j,
                        AnswerContent = $"Đáp án {j} cho câu hỏi {i}",
                        IsCorrect = j == 1, // First answer is correct
                        MultiQuestionId = i,
                        MultiQuestion = multiQuestion
                    };
                    _context.MultiAnswers.Add(multiAnswer);
                }
            }

            _context.SaveChanges();
        }

        [Test]
        public async Task CreateMultipleExamAsync_ValidMidtermExam_ReturnsSuccess()
        {
            // Arrange
            var request = new MultipleExamCreateDTO
            {
                MultiExamName = "Bài thi giữa kỳ Lập trình Web",
                NumberQuestion = 5,
                Duration = 60,
                StartDay = DateTime.Now.AddDays(1),
                EndDay = DateTime.Now.AddDays(2),
                CreateAt = DateTime.Now,
                TeacherId = _context.Teachers.First().TeacherId,
                SubjectId = 1,
                ClassId = 1,
                CategoryExamId = 1, // Midterm category
                SemesterId = 1,
                IsPublish = true,
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 1,
                        NumberQuestion = 5,
                        LevelQuestionId = 1
                    }
                },
                StudentExamDTO = new List<StudentExamDTO>
                {
                    new StudentExamDTO
                    {
                        StudentId = _context.Students.First().StudentId
                    }
                }
            };

            // Act
            var result = await _repository.CreateMultipleExamAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.MultiExamName.Should().Be(request.MultiExamName);
            result.NumberQuestion.Should().Be(request.NumberQuestion);
            result.CategoryExamId.Should().Be(request.CategoryExamId);

            // Verify exam was created in database
            var createdExam = await _context.MultiExams.FirstOrDefaultAsync(e => e.MultiExamName == request.MultiExamName);
            createdExam.Should().NotBeNull();
            createdExam.NumberQuestion.Should().Be(request.NumberQuestion);
        }

        [Test]
        public async Task CreateMultipleExamAsync_InsufficientQuestions_ThrowsException()
        {
            // Arrange
            var request = new MultipleExamCreateDTO
            {
                MultiExamName = "Bài thi giữa kỳ Lập trình Web",
                NumberQuestion = 20, // More than available questions
                Duration = 60,
                StartDay = DateTime.Now.AddDays(1),
                EndDay = DateTime.Now.AddDays(2),
                CreateAt = DateTime.Now,
                TeacherId = _context.Teachers.First().TeacherId,
                SubjectId = 1,
                ClassId = 1,
                CategoryExamId = 1,
                SemesterId = 1,
                IsPublish = true,
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 1,
                        NumberQuestion = 20, // Request more questions than available
                        LevelQuestionId = 1
                    }
                },
                StudentExamDTO = new List<StudentExamDTO>
                {
                    new StudentExamDTO
                    {
                        StudentId = _context.Students.First().StudentId
                    }
                }
            };

            // Act & Assert
            await _repository.Invoking(r => r.CreateMultipleExamAsync(request))
                .Should().ThrowAsync<Exception>()
                .WithMessage("*Không đủ câu hỏi để tạo đề thi*");
        }



        [Test]
        public async Task CreateMultipleExamAsync_InvalidChapterId_ThrowsException()
        {
            // Arrange
            var request = new MultipleExamCreateDTO
            {
                MultiExamName = "Bài thi giữa kỳ Lập trình Web",
                NumberQuestion = 5,
                Duration = 60,
                StartDay = DateTime.Now.AddDays(1),
                EndDay = DateTime.Now.AddDays(2),
                CreateAt = DateTime.Now,
                TeacherId = _context.Teachers.First().TeacherId,
                SubjectId = 1,
                ClassId = 1,
                CategoryExamId = 1,
                SemesterId = 1,
                IsPublish = true,
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 999, // Non-existent chapter
                        NumberQuestion = 5,
                        LevelQuestionId = 1
                    }
                },
                StudentExamDTO = new List<StudentExamDTO>
                {
                    new StudentExamDTO
                    {
                        StudentId = _context.Students.First().StudentId
                    }
                }
            };

            // Act & Assert
            await _repository.Invoking(r => r.CreateMultipleExamAsync(request))
                .Should().ThrowAsync<Exception>()
                .WithMessage("*Không đủ câu hỏi để tạo đề thi*");
        }

        [Test]
        public async Task CreateMultipleExamAsync_NonExistentStudent_IgnoresStudent()
        {
            // Arrange
            var request = new MultipleExamCreateDTO
            {
                MultiExamName = "Bài thi giữa kỳ Lập trình Web",
                NumberQuestion = 5,
                Duration = 60,
                StartDay = DateTime.Now.AddDays(1),
                EndDay = DateTime.Now.AddDays(2),
                CreateAt = DateTime.Now,
                TeacherId = _context.Teachers.First().TeacherId,
                SubjectId = 1,
                ClassId = 1,
                CategoryExamId = 1,
                SemesterId = 1,
                IsPublish = true,
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 1,
                        NumberQuestion = 5,
                        LevelQuestionId = 1
                    }
                },
                StudentExamDTO = new List<StudentExamDTO>
                {
                    new StudentExamDTO
                    {
                        StudentId = Guid.NewGuid() // Non-existent student
                    }
                }
            };

            // Act
            var result = await _repository.CreateMultipleExamAsync(request);

            // Assert
            result.Should().NotBeNull();
            
            // Verify exam was created but no history for non-existent student
            var examHistories = await _context.MultiExamHistories
                .Where(h => h.MultiExamId == result.MultiExamId)
                .ToListAsync();
            examHistories.Should().BeEmpty();
        }

        [Test]
        public async Task CreateMultipleExamAsync_MultipleChapters_CreatesExamSuccessfully()
        {
            // Arrange - Add another chapter
            var chapter2 = new Chapter
            {
                ChapterId = 2,
                ChapterName = "Chương 2: HTML cơ bản",
                Description = "Chương về HTML cơ bản",
                SubjectId = 1
            };
            _context.Chapters.Add(chapter2);

            // Add questions for chapter 2
            for (int i = 11; i <= 15; i++)
            {
                var multiQuestion = new MultiQuestion
                {
                    MultiQuestionId = i,
                    Content = $"Câu hỏi trắc nghiệm {i}",
                    IsActive = true,
                    CreatedBy = _context.Teachers.First().TeacherId,
                    IsPublic = true,
                    ChapterId = 2,
                    CategoryExamId = 1,
                    LevelQuestionId = 1,
                    SemesterId = 1,
                    CreateAt = DateTime.UtcNow
                };
                _context.MultiQuestions.Add(multiQuestion);
            }
            await _context.SaveChangesAsync();

            var request = new MultipleExamCreateDTO
            {
                MultiExamName = "Bài thi giữa kỳ Lập trình Web",
                NumberQuestion = 8,
                Duration = 60,
                StartDay = DateTime.Now.AddDays(1),
                EndDay = DateTime.Now.AddDays(2),
                CreateAt = DateTime.Now,
                TeacherId = _context.Teachers.First().TeacherId,
                SubjectId = 1,
                ClassId = 1,
                CategoryExamId = 1,
                SemesterId = 1,
                IsPublish = true,
                NoQuestionInChapterDTO = new List<NoQuestionInChapterDTO>
                {
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 1,
                        NumberQuestion = 5,
                        LevelQuestionId = 1
                    },
                    new NoQuestionInChapterDTO
                    {
                        ChapterId = 2,
                        NumberQuestion = 3,
                        LevelQuestionId = 1
                    }
                },
                StudentExamDTO = new List<StudentExamDTO>
                {
                    new StudentExamDTO
                    {
                        StudentId = _context.Students.First().StudentId
                    }
                }
            };

            // Act
            var result = await _repository.CreateMultipleExamAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.NumberQuestion.Should().Be(8);

            // Verify NoQuestionInChapter records were created
            var noQuestionRecords = await _context.NoQuestionInChapters
                .Where(n => n.MultiExamId == result.MultiExamId)
                .ToListAsync();
            noQuestionRecords.Should().HaveCount(2);
        }



        [TearDown]
        public void TearDown()
        {
            _context?.Dispose();
        }
    }
} 