using FluentAssertions;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.PracticeExamPaper;
using GESS.Repository.Implement;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GESS.Test
{
    [TestFixture]
    public class CreateExamPaperTests
    {
        private GessDbContext _context;
        private PracticeExamPaperRepository _practiceExamPaperRepository;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<GessDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new GessDbContext(options);
            _practiceExamPaperRepository = new PracticeExamPaperRepository(_context);
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
                UserName = "teacher1",
                Email = "teacher1@test.com",
                Fullname = "Giáo viên 1",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                TwoFactorEnabled = false,
                LockoutEnabled = true,
                AccessFailedCount = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };
            _context.Users.Add(user);

            // Tạo Teacher
            var teacher = new Teacher
            {
                TeacherId = Guid.NewGuid(),
                UserId = user.Id,
                User = user
            };
            _context.Teachers.Add(teacher);

            // Tạo Major
            var major = new Major
            {
                MajorId = 1,
                MajorName = "Công nghệ thông tin"
            };
            _context.Majors.Add(major);

            // Tạo Subject
            var subject = new Subject
            {
                SubjectId = 1,
                SubjectName = "Lập trình web",
                Description = "Môn học về lập trình web",
                Course = "CS101",
                NoCredits = 3
            };
            _context.Subjects.Add(subject);

            // Tạo Semester
            var semester = new Semester
            {
                SemesterId = 1,
                SemesterName = "Học kỳ 1 năm 2024",
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

            // Tạo Chapter
            var chapter = new Chapter
            {
                ChapterId = 1,
                ChapterName = "Chương 1: Giới thiệu",
                Description = "Chương giới thiệu về lập trình web",
                SubjectId = subject.SubjectId,
                Subject = subject
            };
            _context.Chapters.Add(chapter);

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

            _context.SaveChanges();
        }

        [Test]
        public async Task CreateExamPaperAsync_ValidRequest_ReturnsSuccessResponse()
        {
            // Arrange
            var request = new PracticeExamPaperCreateRequest
            {
                ClassId = 1,
                ExamName = "Đề thi giữa kỳ",
                TotalQuestion = 5,
                TeacherId = _context.Teachers.First().TeacherId,
                CategoryExamId = 1,
                ManualQuestions = new List<ManualQuestionDTO>
                {
                    new ManualQuestionDTO
                    {
                        Content = "Câu hỏi 1",
                        Criteria = "Tiêu chí chấm điểm 1",
                        Score = 2.0,
                        Level = "Dễ",
                        ChapterId = 1
                    }
                },
                SelectedQuestions = new List<SelectedQuestionDTO>()
            };

            // Act
            var result = await _practiceExamPaperRepository.CreateExamPaperAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.PracExamPaperId.Should().BeGreaterThan(0);
            result.Message.Should().Be("Tạo đề thi thành công");

            // Kiểm tra PracticeExamPaper được tạo
            var examPaper = _context.PracticeExamPapers.FirstOrDefault(e => e.PracExamPaperId == result.PracExamPaperId);
            examPaper.Should().NotBeNull();
            examPaper.PracExamPaperName.Should().Be("Đề thi giữa kỳ");
            examPaper.NumberQuestion.Should().Be(5);
            examPaper.Status.Should().Be("published");
        }

        [Test]
        public async Task CreateExamPaperAsync_NoSemester_ThrowsException()
        {
            // Arrange - Xóa tất cả semester
            _context.Semesters.RemoveRange(_context.Semesters);
            await _context.SaveChangesAsync();

            var request = new PracticeExamPaperCreateRequest
            {
                ClassId = 1,
                ExamName = "Đề thi giữa kỳ",
                TotalQuestion = 5,
                TeacherId = _context.Teachers.First().TeacherId,
                CategoryExamId = 1,
                ManualQuestions = new List<ManualQuestionDTO>(),
                SelectedQuestions = new List<SelectedQuestionDTO>()
            };

            // Act & Assert
            var action = async () => await _practiceExamPaperRepository.CreateExamPaperAsync(request);
            await action.Should().ThrowAsync<Exception>().WithMessage("Không tìm thấy học kỳ.");
        }

        [Test]
        public async Task CreateExamPaperAsync_InvalidClassId_ThrowsException()
        {
            // Arrange
            var request = new PracticeExamPaperCreateRequest
            {
                ClassId = 999, // Class không tồn tại
                ExamName = "Đề thi giữa kỳ",
                TotalQuestion = 5,
                TeacherId = _context.Teachers.First().TeacherId,
                CategoryExamId = 1,
                ManualQuestions = new List<ManualQuestionDTO>(),
                SelectedQuestions = new List<SelectedQuestionDTO>()
            };

            // Act & Assert
            var action = async () => await _practiceExamPaperRepository.CreateExamPaperAsync(request);
            await action.Should().ThrowAsync<Exception>().WithMessage("Không tìm thấy lớp học.");
        }

        [Test]
        public async Task CreateExamPaperAsync_WithManualQuestions_CreatesQuestionsAndAnswers()
        {
            // Arrange
            var request = new PracticeExamPaperCreateRequest
            {
                ClassId = 1,
                ExamName = "Đề thi với câu hỏi thủ công",
                TotalQuestion = 2,
                TeacherId = _context.Teachers.First().TeacherId,
                CategoryExamId = 1,
                ManualQuestions = new List<ManualQuestionDTO>
                {
                    new ManualQuestionDTO
                    {
                        Content = "Câu hỏi thủ công 1",
                        Criteria = "Tiêu chí chấm điểm 1",
                        Score = 2.0,
                        Level = "Trung bình",
                        ChapterId = 1
                    },
                    new ManualQuestionDTO
                    {
                        Content = "Câu hỏi thủ công 2",
                        Criteria = "Tiêu chí chấm điểm 2",
                        Score = 3.0,
                        Level = "Khó",
                        ChapterId = 1
                    }
                },
                SelectedQuestions = new List<SelectedQuestionDTO>()
            };

            // Act
            var result = await _practiceExamPaperRepository.CreateExamPaperAsync(request);

            // Assert
            result.Should().NotBeNull();

            // Kiểm tra PracticeQuestion được tạo
            var practiceQuestions = _context.PracticeQuestions.Where(pq => pq.CreatedBy == request.TeacherId).ToList();
            practiceQuestions.Should().HaveCount(2);
            practiceQuestions.Should().Contain(pq => pq.Content == "Câu hỏi thủ công 1");
            practiceQuestions.Should().Contain(pq => pq.Content == "Câu hỏi thủ công 2");

            // Kiểm tra PracticeAnswer được tạo
            var practiceAnswers = _context.PracticeAnswers.Where(pa => practiceQuestions.Select(pq => pq.PracticeQuestionId).Contains(pa.PracticeQuestionId)).ToList();
            practiceAnswers.Should().HaveCount(2);
        }

        [Test]
        public async Task CreateExamPaperAsync_WithSelectedQuestions_CreatesTestQuestions()
        {
            // Arrange - Tạo sẵn PracticeQuestion
            var existingQuestion = new PracticeQuestion
            {
                Content = "Câu hỏi có sẵn",
                IsActive = true,
                ChapterId = 1,
                CategoryExamId = 1,
                LevelQuestionId = 1,
                SemesterId = 1,
                CreateAt = DateTime.UtcNow,
                CreatedBy = _context.Teachers.First().TeacherId,
                IsPublic = true
            };
            _context.PracticeQuestions.Add(existingQuestion);
            await _context.SaveChangesAsync();

            var request = new PracticeExamPaperCreateRequest
            {
                ClassId = 1,
                ExamName = "Đề thi với câu hỏi có sẵn",
                TotalQuestion = 1,
                TeacherId = _context.Teachers.First().TeacherId,
                CategoryExamId = 1,
                ManualQuestions = new List<ManualQuestionDTO>(),
                SelectedQuestions = new List<SelectedQuestionDTO>
                {
                    new SelectedQuestionDTO
                    {
                        PracticeQuestionId = existingQuestion.PracticeQuestionId,
                        Score = 2.5
                    }
                }
            };

            // Act
            var result = await _practiceExamPaperRepository.CreateExamPaperAsync(request);

            // Assert
            result.Should().NotBeNull();

            // Kiểm tra PracticeTestQuestion được tạo
            var testQuestions = _context.PracticeTestQuestions.Where(ptq => ptq.PracExamPaperId == result.PracExamPaperId).ToList();
            testQuestions.Should().HaveCount(1);
            testQuestions[0].PracticeQuestionId.Should().Be(existingQuestion.PracticeQuestionId);
            testQuestions[0].Score.Should().Be(2.5);
            testQuestions[0].QuestionOrder.Should().Be(1);
        }

        [Test]
        public async Task CreateExamPaperAsync_WithMixedQuestions_CreatesCorrectOrder()
        {
            // Arrange - Tạo sẵn PracticeQuestion
            var existingQuestion = new PracticeQuestion
            {
                Content = "Câu hỏi có sẵn",
                IsActive = true,
                ChapterId = 1,
                CategoryExamId = 1,
                LevelQuestionId = 1,
                SemesterId = 1,
                CreateAt = DateTime.UtcNow,
                CreatedBy = _context.Teachers.First().TeacherId,
                IsPublic = true
            };
            _context.PracticeQuestions.Add(existingQuestion);
            await _context.SaveChangesAsync();

            var request = new PracticeExamPaperCreateRequest
            {
                ClassId = 1,
                ExamName = "Đề thi hỗn hợp",
                TotalQuestion = 3,
                TeacherId = _context.Teachers.First().TeacherId,
                CategoryExamId = 1,
                ManualQuestions = new List<ManualQuestionDTO>
                {
                    new ManualQuestionDTO
                    {
                        Content = "Câu hỏi thủ công 1",
                        Criteria = "Tiêu chí 1",
                        Score = 1.0,
                        Level = "Dễ",
                        ChapterId = 1
                    },
                    new ManualQuestionDTO
                    {
                        Content = "Câu hỏi thủ công 2",
                        Criteria = "Tiêu chí 2",
                        Score = 2.0,
                        Level = "Trung bình",
                        ChapterId = 1
                    }
                },
                SelectedQuestions = new List<SelectedQuestionDTO>
                {
                    new SelectedQuestionDTO
                    {
                        PracticeQuestionId = existingQuestion.PracticeQuestionId,
                        Score = 3.0
                    }
                }
            };

            // Act
            var result = await _practiceExamPaperRepository.CreateExamPaperAsync(request);

            // Assert
            result.Should().NotBeNull();

            // Kiểm tra thứ tự câu hỏi
            var testQuestions = _context.PracticeTestQuestions
                .Where(ptq => ptq.PracExamPaperId == result.PracExamPaperId)
                .OrderBy(ptq => ptq.QuestionOrder)
                .ToList();

            testQuestions.Should().HaveCount(3);
            testQuestions.Should().Contain(tq => tq.QuestionOrder == 1);
            testQuestions.Should().Contain(tq => tq.QuestionOrder == 2);
            testQuestions.Should().Contain(tq => tq.QuestionOrder == 3);
        }

        [Test]
        public async Task CreateExamPaperAsync_InvalidLevel_DefaultsToMedium()
        {
            // Arrange
            var request = new PracticeExamPaperCreateRequest
            {
                ClassId = 1,
                ExamName = "Đề thi với level không hợp lệ",
                TotalQuestion = 1,
                TeacherId = _context.Teachers.First().TeacherId,
                CategoryExamId = 1,
                ManualQuestions = new List<ManualQuestionDTO>
                {
                    new ManualQuestionDTO
                    {
                        Content = "Câu hỏi với level không hợp lệ",
                        Criteria = "Tiêu chí chấm điểm",
                        Score = 1.0,
                        Level = "Không hợp lệ", // Level không tồn tại
                        ChapterId = 1
                    }
                },
                SelectedQuestions = new List<SelectedQuestionDTO>()
            };

            // Act
            var result = await _practiceExamPaperRepository.CreateExamPaperAsync(request);

            // Assert
            result.Should().NotBeNull();

            // Kiểm tra LevelQuestionId được set mặc định là 2 (Trung bình)
            var practiceQuestion = _context.PracticeQuestions.FirstOrDefault(pq => pq.CreatedBy == request.TeacherId);
            practiceQuestion.Should().NotBeNull();
            practiceQuestion.LevelQuestionId.Should().Be(2); // Mặc định là "Trung bình"
        }
    }
} 