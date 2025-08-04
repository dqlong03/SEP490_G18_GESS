using NUnit.Framework;
using Microsoft.EntityFrameworkCore;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Implement;
using GESS.Model.QuestionPracExam;
using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;

namespace GESS.Test
{
    [TestFixture]
    public class GradeSubmissionRepositoryTests
    {
        private GessDbContext _context;
        private GradeScheduleRepository _repository;

        [SetUp]
        public void Setup()
        {
            // Khởi tạo In-Memory Database cho testing
            var options = new DbContextOptionsBuilder<GessDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new GessDbContext(options);

            // Khởi tạo repository
            _repository = new GradeScheduleRepository(_context);

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
                EnrollDate = DateTime.Now.AddYears(-1),
                AvatarURL = "https://example.com/avatar.jpg"
            };
            _context.Students.Add(student);

            // Tạo CategoryExam
            var categoryExam = new CategoryExam
            {
                CategoryExamId = 1,
                CategoryExamName = "Giữa kỳ"
            };
            _context.CategoryExams.Add(categoryExam);

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

            // Tạo Class
            var classEntity = new Class
            {
                ClassId = 1,
                ClassName = "SE1601",
                TeacherId = teacher.TeacherId,
                SubjectId = 1,
                SemesterId = 1,
                CreatedDate = DateTime.Now.AddDays(-5)
            };
            _context.Classes.Add(classEntity);

            // Tạo Chapter
            var chapter = new Chapter
            {
                ChapterId = 1,
                ChapterName = "Chương 1",
                SubjectId = 1,
                Description = "Chương học cơ bản"
            };
            _context.Chapters.Add(chapter);

            // Tạo LevelQuestion
            var levelQuestion = new LevelQuestion
            {
                LevelQuestionId = 1,
                LevelQuestionName = "Dễ",
               
            };
            _context.LevelQuestions.Add(levelQuestion);

            // Tạo PracticeExam
            var practiceExam = new PracticeExam
            {
                PracExamId = 1,
                PracExamName = "Bài thi tự luận 1",
                TeacherId = teacher.TeacherId,
                Duration = 60,
                StartDay = DateTime.Now.AddDays(-1),
                CreateAt = DateTime.Now.AddDays(-2),
                Status = "Đã đóng ca",
                IsGraded = 0,
                CategoryExamId = 1,
                SubjectId = 1,
                SemesterId = 1,
                ClassId = 1
            };
            _context.PracticeExams.Add(practiceExam);

            // Tạo PracticeExamPaper
            var practiceExamPaper = new PracticeExamPaper
            {
                PracExamPaperId = 1,
                PracExamPaperName = "Đề thi 1",
                NumberQuestion = 1,
                CreateAt = DateTime.Now.AddDays(-3),
                Status = "Published",
                TeacherId = teacher.TeacherId,
                CategoryExamId = 1,
                SubjectId = 1,
                SemesterId = 1
            };
            _context.PracticeExamPapers.Add(practiceExamPaper);

            // Tạo PracticeQuestion
            var practiceQuestion = new PracticeQuestion
            {
                PracticeQuestionId = 1,
                Content = "Câu hỏi tự luận 1",
                IsActive = true,
                CreatedBy = teacherUser.Id,
                IsPublic = true,
                ChapterId = 1,
                CategoryExamId = 1,
                LevelQuestionId = 1,
                SemesterId = 1,
                CreateAt = DateTime.Now.AddDays(-4)
            };
            _context.PracticeQuestions.Add(practiceQuestion);

            // Tạo PracticeAnswer
            var practiceAnswer = new PracticeAnswer
            {
                
                PracticeQuestionId = 1,
                AnswerContent = "Đáp án mẫu",
                GradingCriteria = "Tiêu chí chấm điểm"
            };
            _context.PracticeAnswers.Add(practiceAnswer);

            // Tạo PracticeTestQuestion
            var practiceTestQuestion = new PracticeTestQuestion
            {
                PracExamPaperId = 1,
                PracticeQuestionId = 1,
                QuestionOrder = 1,
                Score = 10.0
            };
            _context.PracticeTestQuestions.Add(practiceTestQuestion);

            // Tạo PracticeExamHistory
            var practiceExamHistory = new PracticeExamHistory
            {
                PracExamHistoryId = Guid.NewGuid(),
                StudentId = student.StudentId,
                PracExamId = 1,
                PracExamPaperId = 1,
                StartTime = DateTime.Now.AddDays(-1),
                EndTime = DateTime.Now.AddDays(-1).AddHours(1),
                IsGraded = false,
                StatusExam = "Chưa chấm",
                CheckIn = true
            };
            _context.PracticeExamHistories.Add(practiceExamHistory);

            // Tạo QuestionPracExam
            var questionPracExam = new QuestionPracExam
            {
                PracExamHistoryId = practiceExamHistory.PracExamHistoryId,
                PracticeQuestionId = 1,
                Answer = "Câu trả lời của sinh viên",
                Score = 0.0
            };
            _context.QuestionPracExams.Add(questionPracExam);

            _context.SaveChanges();
        }

        // ========== GRADE SUBMISSION TEST CASES THEO DECISION TABLE ==========

        [Test]
        public async Task GradeSubmission_TestCase1_AllValidInputs_ReturnsTrue()
        {
            // Arrange: Tất cả inputs hợp lệ (Test Case 1)
            var teacherId = _context.Teachers.First().TeacherId;
            var examId = 1;
            var studentId = _context.Students.First().StudentId;
            var questionPracExamDTO = new QuestionPracExamGradeDTO
            {
                PracExamHistoryId = _context.PracticeExamHistories.First().PracExamHistoryId,
                PracticeQuestionId = 1,
                GradedScore = 8.5
            };

            // Act: Giảng viên chấm điểm
            var result = await _repository.GradeSubmission(teacherId, examId, studentId, questionPracExamDTO);

            // Assert: Thành công
            result.Should().BeTrue();

            // Kiểm tra điểm đã được cập nhật
            var updatedQuestion = _context.QuestionPracExams
                .First(q => q.PracExamHistoryId == questionPracExamDTO.PracExamHistoryId 
                           && q.PracticeQuestionId == questionPracExamDTO.PracticeQuestionId);
            updatedQuestion.Score.Should().Be(8.5);
        }

        [Test]
        public async Task GradeSubmission_TestCase2_InvalidTeacherId_ReturnsFalse()
        {
            // Arrange: TeacherId không hợp lệ (Test Case 2)
            var teacherId = Guid.NewGuid(); // TeacherId không tồn tại
            var examId = 1;
            var studentId = _context.Students.First().StudentId;
            var questionPracExamDTO = new QuestionPracExamGradeDTO
            {
                PracExamHistoryId = _context.PracticeExamHistories.First().PracExamHistoryId,
                PracticeQuestionId = 1,
                GradedScore = 8.5
            };

            // Act: Giảng viên cố gắng chấm điểm
            var result = await _repository.GradeSubmission(teacherId, examId, studentId, questionPracExamDTO);

            // Assert: Thất bại vì teacherId không hợp lệ
            result.Should().BeFalse();
        }

        [Test]
        public async Task GradeSubmission_TestCase3_InvalidExamId_ReturnsFalse()
        {
            // Arrange: ExamId không hợp lệ (Test Case 3)
            var teacherId = _context.Teachers.First().TeacherId;
            var examId = 999; // ExamId không tồn tại
            var studentId = _context.Students.First().StudentId;
            var questionPracExamDTO = new QuestionPracExamGradeDTO
            {
                PracExamHistoryId = _context.PracticeExamHistories.First().PracExamHistoryId,
                PracticeQuestionId = 1,
                GradedScore = 8.5
            };

            // Act: Giảng viên cố gắng chấm điểm
            var result = await _repository.GradeSubmission(teacherId, examId, studentId, questionPracExamDTO);

            // Assert: Thất bại vì examId không hợp lệ
            result.Should().BeFalse();
        }

        [Test]
        public async Task GradeSubmission_TestCase4_InvalidStudentId_ReturnsFalse()
        {
            // Arrange: StudentId không hợp lệ (Test Case 4)
            var teacherId = _context.Teachers.First().TeacherId;
            var examId = 1;
            var studentId = Guid.NewGuid(); // StudentId không tồn tại
            var questionPracExamDTO = new QuestionPracExamGradeDTO
            {
                PracExamHistoryId = _context.PracticeExamHistories.First().PracExamHistoryId,
                PracticeQuestionId = 1,
                GradedScore = 8.5
            };

            // Act: Giảng viên cố gắng chấm điểm
            var result = await _repository.GradeSubmission(teacherId, examId, studentId, questionPracExamDTO);

            // Assert: Thất bại vì studentId không hợp lệ
            result.Should().BeFalse();
        }

        [Test]
        public async Task GradeSubmission_TestCase5_ValidInputsButInvalidPracExamHistoryId_ReturnsFalse()
        {
            // Arrange: Valid teacherId, examId, studentId nhưng PracExamHistoryId trong DTO không hợp lệ (Test Case 5)
            var teacherId = _context.Teachers.First().TeacherId;
            var examId = 1;
            var studentId = _context.Students.First().StudentId;
            var questionPracExamDTO = new QuestionPracExamGradeDTO
            {
                PracExamHistoryId = Guid.NewGuid(), // HistoryId không tồn tại
                PracticeQuestionId = 1,
                GradedScore = 8.5
            };

            // Act: Giảng viên cố gắng chấm điểm
            var result = await _repository.GradeSubmission(teacherId, examId, studentId, questionPracExamDTO);

            // Assert: Thất bại vì không tìm thấy bài làm
            result.Should().BeFalse();
        }

        [Test]
        public async Task GradeSubmission_TestCase6_ValidInputsButInvalidPracticeQuestionId_ReturnsFalse()
        {
            // Arrange: Valid teacherId, examId, studentId nhưng PracticeQuestionId trong DTO không hợp lệ (Test Case 6)
            var teacherId = _context.Teachers.First().TeacherId;
            var examId = 1;
            var studentId = _context.Students.First().StudentId;
            var questionPracExamDTO = new QuestionPracExamGradeDTO
            {
                PracExamHistoryId = _context.PracticeExamHistories.First().PracExamHistoryId,
                PracticeQuestionId = 999, // QuestionId không tồn tại
                GradedScore = 8.5
            };

            // Act: Giảng viên cố gắng chấm điểm
            var result = await _repository.GradeSubmission(teacherId, examId, studentId, questionPracExamDTO);

            // Assert: Thất bại vì không tìm thấy câu hỏi
            result.Should().BeFalse();
        }

        [Test]
        public async Task GradeSubmission_TestCase7_ValidInputsButInvalidGradeScore_ReturnsFalse()
        {
            // Arrange: Valid teacherId, examId, studentId nhưng GradeScore trong DTO không hợp lệ (Test Case 7)
            var teacherId = _context.Teachers.First().TeacherId;
            var examId = 1;
            var studentId = _context.Students.First().StudentId;
            var questionPracExamDTO = new QuestionPracExamGradeDTO
            {
                PracExamHistoryId = _context.PracticeExamHistories.First().PracExamHistoryId,
                PracticeQuestionId = 1,
                GradedScore = 15.0 // Điểm vượt quá tối đa (10.0)
            };

            // Act: Giảng viên cố gắng chấm điểm
            var result = await _repository.GradeSubmission(teacherId, examId, studentId, questionPracExamDTO);

            // Assert: Thất bại vì điểm không hợp lệ
            result.Should().BeFalse();
        }
    }
} 