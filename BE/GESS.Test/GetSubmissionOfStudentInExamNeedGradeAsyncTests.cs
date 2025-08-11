using NUnit.Framework;
using Microsoft.EntityFrameworkCore;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Implement;
using GESS.Model.GradeSchedule;
using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;

namespace GESS.Test
{
    [TestFixture]
    public class GetSubmissionOfStudentInExamNeedGradeAsyncTests
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

            // Tạo Class
            var class1 = new Class
            {
                ClassId = 1,
                ClassName = "SE1601",
                TeacherId = teacher.TeacherId,
                SubjectId = 1,
                SemesterId = 1,
                CreatedDate = DateTime.Now
            };
            _context.Classes.Add(class1);

            // Tạo CategoryExam
            var categoryExam = new CategoryExam
            {
                CategoryExamId = 1,
                CategoryExamName = "Thi cuối kỳ",
   
            };
            _context.CategoryExams.Add(categoryExam);

            // Tạo LevelQuestion
            var levelQuestion = new LevelQuestion
            {
                LevelQuestionId = 1,
                LevelQuestionName = "Dễ",
    
            };
            _context.LevelQuestions.Add(levelQuestion);

            // Tạo Room
            var room = new Room
            {
                RoomId = 1,
                RoomName = "A101",
                Description = "Phòng thi A101",
                Status = "Available",
                Capacity = 50
            };
            _context.Rooms.Add(room);

            // Tạo ExamSlot
            var examSlot = new ExamSlot
            {
                ExamSlotId = 1,
                SlotName = "Ca 1",
                StartTime = new TimeSpan(8, 0, 0),
                EndTime = new TimeSpan(10, 0, 0)
            };
            _context.ExamSlots.Add(examSlot);

            // Tạo PracticeExam
            var practiceExam = new PracticeExam
            {
                PracExamId = 1,
                PracExamName = "Bài thi tự luận 1",
                TeacherId = teacher.TeacherId,
                Duration = 60,
                StartDay = DateTime.Now.AddDays(-5),
                CreateAt = DateTime.Now.AddDays(-10),
                Status = "Đã đóng ca",
                IsGraded = 0,
                CategoryExamId = 1,
                SubjectId = 1,
                SemesterId = 1,
                ClassId = 1
            };
            _context.PracticeExams.Add(practiceExam);

            // Tạo ExamSlotRoom
            var examSlotRoom = new ExamSlotRoom
            {
                ExamSlotRoomId = 1,
                ExamSlotId = 1,
                RoomId = 1,
                ExamGradedId = teacher.TeacherId,
                SupervisorId = teacher.TeacherId,
                PracticeExamId = 1,
                SubjectId = 1,
                SemesterId = 1,
                ExamDate = DateTime.Now.AddDays(-5),
                IsGraded = 0,
                MultiOrPractice = "Practice"
            };
            _context.ExamSlotRooms.Add(examSlotRoom);

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

                AvatarURL = "avatar1.jpg"
            };
            _context.Students.Add(student);

            // Tạo PracticeExamPaper
            var practiceExamPaper = new PracticeExamPaper
            {
                PracExamPaperId = 1,
                PracExamPaperName = "Đề thi tự luận 1",
                NumberQuestion = 1,
                CreateAt = DateTime.Now,
                Status = "Published",
                TeacherId = teacher.TeacherId,
                CategoryExamId = 1,
                SubjectId = 1,
                SemesterId = 1,

            };
            _context.PracticeExamPapers.Add(practiceExamPaper);

            // Tạo Chapter
            var chapter = new Chapter
            {
                ChapterId = 1,
                ChapterName = "Chương 1",
                SubjectId = 1,
                Description = "Mô tả chương 1"
            };
            _context.Chapters.Add(chapter);

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
                CreateAt = DateTime.Now,
                PracticeAnswer = new PracticeAnswer
                {
                    AnswerId = 1,
                    AnswerContent = "Đáp án mẫu cho câu hỏi tự luận",
                    GradingCriteria = "Tiêu chí chấm điểm",
                    PracticeQuestionId = 1
                }
            };
            _context.PracticeQuestions.Add(practiceQuestion);

            // Tạo PracticeTestQuestion
            var practiceTestQuestion = new PracticeTestQuestion
            {
                PracticeQuestionId = 1,
                PracExamPaperId = 1,
                QuestionOrder = 1,
                Score = 10.0
            };
            _context.PracticeTestQuestions.Add(practiceTestQuestion);

            // Tạo PracticeExamHistory
            var practiceExamHistory = new PracticeExamHistory
            {
                PracExamHistoryId = Guid.NewGuid(),
                PracExamId = 1,
                StudentId = student.StudentId,
                Student = student,
                PracticeExam = practiceExam,
                ExamSlotRoomId = 1,
                ExamSlotRoom = examSlotRoom,
                PracExamPaperId = 1,
                PracticeExamPaper = practiceExamPaper,
                IsGraded = false,
                StatusExam = "Chưa chấm",
                Score = null
            };
            _context.PracticeExamHistories.Add(practiceExamHistory);

            // Tạo QuestionPracExam
            var questionPracExam = new QuestionPracExam
            {
                PracExamHistoryId = practiceExamHistory.PracExamHistoryId,
                PracticeQuestionId = 1,
                PracticeQuestion = practiceQuestion,
                PracticeExamHistory = practiceExamHistory,
                Answer = "Câu trả lời của sinh viên",
                Score = 0.0
            };
            _context.QuestionPracExams.Add(questionPracExam);

            _context.SaveChanges();
        }

        // ========== GET SUBMISSION OF STUDENT IN EXAM NEED GRADE ASYNC TEST CASES ==========

        [Test]
        public async Task GetSubmissionOfStudentInExamNeedGradeAsync_TestCase1_ValidAllData_ReturnsSubmission()
        {
            // Arrange: TeacherId, ExamId và StudentId hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;
            var examId = 1; // PracExamId = 1
            var studentId = _context.Students.First().StudentId;

            // Act: Lấy bài làm của sinh viên
            var result = await _repository.GetSubmissionOfStudentInExamNeedGradeAsync(teacherId, examId, studentId);

            // Assert: Trả về bài làm của sinh viên
            result.Should().NotBeNull();
            result.StudentCode.Should().Be("SV001");
            result.FullName.Should().Be("Sinh viên 1");
            result.QuestionPracExamDTO.Should().NotBeNull();
            result.QuestionPracExamDTO.Should().HaveCount(1);
        }

        [Test]
        public async Task GetSubmissionOfStudentInExamNeedGradeAsync_TestCase3_InvalidExamId_ReturnsNull()
        {
            // Arrange: ExamId không hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;
            var invalidExamId = 999; // ExamId không tồn tại
            var studentId = _context.Students.First().StudentId;

            // Act: Lấy bài làm của sinh viên
            var result = await _repository.GetSubmissionOfStudentInExamNeedGradeAsync(teacherId, invalidExamId, studentId);

            // Assert: Trả về null
            result.Should().BeNull();
        }

        [Test]
        public async Task GetSubmissionOfStudentInExamNeedGradeAsync_TestCase4_InvalidStudentId_ReturnsNull()
        {
            // Arrange: StudentId không hợp lệ
            var teacherId = _context.Teachers.First().TeacherId;
            var examId = 1;
            var invalidStudentId = Guid.NewGuid(); // StudentId không tồn tại

            // Act: Lấy bài làm của sinh viên
            var result = await _repository.GetSubmissionOfStudentInExamNeedGradeAsync(teacherId, examId, invalidStudentId);

            // Assert: Trả về null
            result.Should().BeNull();
        }
    }
} 