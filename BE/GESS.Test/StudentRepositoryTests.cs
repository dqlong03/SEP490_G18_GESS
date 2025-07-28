using NUnit.Framework;
using Moq;
using GESS.Model.Exam;
using GESS.Entity.Entities;
using GESS.Entity.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GESS.Common;
using GESS.Repository.Implement;

namespace GESS.Test
{
    [TestFixture]
    public class StudentRepositoryTests
    {
        private GessDbContext _context;
        private Mock<UserManager<User>> _mockUserManager;
        private StudentRepository _studentRepository;

        [SetUp]
        public void Setup()
        {
            // Khởi tạo mock cho UserManager<User>
            _mockUserManager = new Mock<UserManager<User>>(
                Mock.Of<IUserStore<User>>(), null, null, null, null, null, null, null, null);

            // Tạo in-memory database thay vì mock DbContext
            var options = new DbContextOptionsBuilder<GessDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new GessDbContext(options);

            // Khởi tạo StudentRepository với in-memory database
            _studentRepository = new StudentRepository(_context, _mockUserManager.Object);
        }

        [TearDown]
        public void TearDown()
        {
            _context?.Dispose();
        }

        // ========== EXAM SCORE HISTORY TEST CASES ==========

        [Test]
        public async Task GetHistoryExamOfStudentBySubIdAsync_ValidData_ReturnsSuccess()
        {
            // Arrange: Chuẩn bị dữ liệu test
            var studentId = Guid.NewGuid();
            var subjectId = 1;
            var semesterId = 1;
            var year = 2024;

            // Tạo dữ liệu test trong in-memory database
            var categoryExam = new CategoryExam
            {
                CategoryExamId = 1,
                CategoryExamName = "Giữa kỳ"
            };

            var subject = new Subject
            {
                SubjectId = subjectId,
                SubjectName = "Toán học",
                Description = "Môn học cơ bản về toán học",
                Course = "MATH101",
                NoCredits = 3
            };

            var semester = new Semester
            {
                SemesterId = semesterId,
                SemesterName = "Học kỳ 1",
                IsActive = true
            };

            var major = new Major
            {
                MajorId = 1,
                MajorName = "Công nghệ thông tin",
                StartDate = DateTime.Now.AddYears(-5),
                IsActive = true
            };

            var user = new User
            {
                Id = studentId,
                UserName = "testuser",
                Email = "test@example.com",
                Fullname = "Test User"
            };

            var teacherUser = new User
            {
                Id = Guid.NewGuid(),
                UserName = "teacher",
                Email = "teacher@example.com",
                Fullname = "Test Teacher"
            };

            var teacher = new Teacher
            {
                TeacherId = Guid.NewGuid(),
                UserId = teacherUser.Id,
                User = teacherUser,
                HireDate = DateTime.Now.AddYears(-2),
                MajorId = major.MajorId,
                Major = major,
                IsHeadOfDepartment = false,
                IsExamManager = false
            };

            var classEntity = new Class
            {
                ClassId = 1,
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                SubjectId = subjectId,
                Subject = subject,
                SemesterId = semesterId,
                Semester = semester,
                ClassName = "Lớp Toán 1",
                CreatedDate = DateTime.Now.AddMonths(-2)
            };

            var student = new Student
            {
                StudentId = Guid.NewGuid(),
                UserId = studentId,
                User = user,
                EnrollDate = DateTime.Now.AddYears(-1),
                AvatarURL = "https://example.com/avatar.jpg"
            };

            var multiExam = new MultiExam
            {
                MultiExamId = 1,
                MultiExamName = "Bài thi giữa kỳ",
                NumberQuestion = 20,
                StartDay = DateTime.Now.AddDays(1),
                EndDay = DateTime.Now.AddDays(2),
                Duration = 60,
                CreateAt = new DateTime(year, 3, 15),
                Status = "Published",
                CodeStart = "TEST001",
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                SubjectId = subjectId,
                Subject = subject,
                CategoryExamId = categoryExam.CategoryExamId,
                CategoryExam = categoryExam,
                SemesterId = semesterId,
                Semester = semester,
                ClassId = classEntity.ClassId,
                Class = classEntity,
                IsPublish = true
            };

            var practiceExam = new PracticeExam
            {
                PracExamId = 2,
                PracExamName = "Bài thi cuối kỳ",
                Duration = 90,
                StartDay = DateTime.Now.AddDays(5),
                EndDay = DateTime.Now.AddDays(6),
                CreateAt = new DateTime(year, 6, 20),
                Status = "Published",
                CodeStart = "TEST002",
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                CategoryExamId = categoryExam.CategoryExamId,
                CategoryExam = categoryExam,
                SubjectId = subjectId,
                Subject = subject,
                SemesterId = semesterId,
                Semester = semester,
                ClassId = classEntity.ClassId,
                Class = classEntity
            };

            var multiExamHistory = new MultiExamHistory
            {
                ExamHistoryId = Guid.NewGuid(),
                StudentId = student.StudentId,
                StartTime = DateTime.Now.AddHours(-2),
                EndTime = DateTime.Now.AddHours(-1),
                Score = 8.5,
                StatusExam = PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM,
                MultiExam = multiExam,
                Student = student
            };

            var practiceExamHistory = new PracticeExamHistory
            {
                PracExamHistoryId = Guid.NewGuid(),
                StudentId = student.StudentId,
                StartTime = DateTime.Now.AddDays(-1).AddHours(-3),
                EndTime = DateTime.Now.AddDays(-1).AddHours(-1),
                Score = 7.8,
                StatusExam = PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM,
                PracticeExam = practiceExam,
                Student = student
            };

            // Thêm dữ liệu vào in-memory database
            _context.CategoryExams.Add(categoryExam);
            _context.Subjects.Add(subject);
            _context.Semesters.Add(semester);
            _context.Majors.Add(major);
            _context.Users.Add(user);
            _context.Users.Add(teacherUser);
            _context.Teachers.Add(teacher);
            _context.Classes.Add(classEntity);
            _context.Students.Add(student);
            _context.MultiExams.Add(multiExam);
            _context.PracticeExams.Add(practiceExam);
            _context.MultiExamHistories.Add(multiExamHistory);
            _context.PracticeExamHistories.Add(practiceExamHistory);
            await _context.SaveChangesAsync();

            // Act: Gọi method cần test
            var result = await _studentRepository.GetHistoryExamOfStudentBySubIdAsync(semesterId, year, subjectId, studentId);

            // Assert: Kiểm tra kết quả
            Assert.IsNotNull(result);
            Assert.AreEqual(2, result.Count);
            
            // Kiểm tra bài thi trắc nghiệm
            var multiExamResult = result.FirstOrDefault(r => r.ExamType == "Multi");
            Assert.IsNotNull(multiExamResult);
            Assert.AreEqual("Bài thi giữa kỳ", multiExamResult.ExamName);
            Assert.AreEqual("Giữa kỳ", multiExamResult.CategoryExamName);
            Assert.AreEqual(60, multiExamResult.Duration);
            Assert.AreEqual(8.5, multiExamResult.Score);

            // Kiểm tra bài thi tự luận
            var practiceExamResult = result.FirstOrDefault(r => r.ExamType == "Practice");
            Assert.IsNotNull(practiceExamResult);
            Assert.AreEqual("Bài thi cuối kỳ", practiceExamResult.ExamName);
            Assert.AreEqual("Giữa kỳ", practiceExamResult.CategoryExamName);
            Assert.AreEqual(90, practiceExamResult.Duration);
            Assert.AreEqual(7.8, practiceExamResult.Score);
        }

        [Test]
        public async Task GetHistoryExamOfStudentBySubIdAsync_NoData_ReturnsEmptyList()
        {
            // Arrange: Chuẩn bị dữ liệu test với studentId không có dữ liệu
            var invalidStudentId = Guid.NewGuid();
            var subjectId = 1;
            var semesterId = 1;
            var year = 2024;

            // Act: Gọi method cần test
            var result = await _studentRepository.GetHistoryExamOfStudentBySubIdAsync(semesterId, year, subjectId, invalidStudentId);

            // Assert: Kiểm tra kết quả trả về danh sách rỗng
            Assert.IsNotNull(result);
            Assert.AreEqual(0, result.Count);
        }

        [Test]
        public async Task GetHistoryExamOfStudentBySubIdAsync_OnlyMultiExams_ReturnsMultiExamsOnly()
        {
            // Arrange: Chuẩn bị dữ liệu test chỉ có bài thi trắc nghiệm
            var studentId = Guid.NewGuid();
            var subjectId = 1;
            var semesterId = 1;
            var year = 2024;

            // Tạo dữ liệu test
            var categoryExam = new CategoryExam
            {
                CategoryExamId = 1,
                CategoryExamName = "Kiểm tra"
            };

            var subject = new Subject
            {
                SubjectId = subjectId,
                SubjectName = "Toán học",
                Description = "Môn học cơ bản về toán học",
                Course = "MATH101",
                NoCredits = 3
            };

            var semester = new Semester
            {
                SemesterId = semesterId,
                SemesterName = "Học kỳ 1",
                IsActive = true
            };

            var major = new Major
            {
                MajorId = 1,
                MajorName = "Công nghệ thông tin",
                StartDate = DateTime.Now.AddYears(-5),
                IsActive = true
            };

            var user = new User
            {
                Id = studentId,
                UserName = "testuser",
                Email = "test@example.com",
                Fullname = "Test User"
            };

            var teacherUser = new User
            {
                Id = Guid.NewGuid(),
                UserName = "teacher",
                Email = "teacher@example.com",
                Fullname = "Test Teacher"
            };

            var teacher = new Teacher
            {
                TeacherId = Guid.NewGuid(),
                UserId = teacherUser.Id,
                User = teacherUser,
                HireDate = DateTime.Now.AddYears(-2),
                MajorId = major.MajorId,
                Major = major,
                IsHeadOfDepartment = false,
                IsExamManager = false
            };

            var classEntity = new Class
            {
                ClassId = 1,
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                SubjectId = subjectId,
                Subject = subject,
                SemesterId = semesterId,
                Semester = semester,
                ClassName = "Lớp Toán 1",
                CreatedDate = DateTime.Now.AddMonths(-2)
            };

            var student = new Student
            {
                StudentId = Guid.NewGuid(),
                UserId = studentId,
                User = user,
                EnrollDate = DateTime.Now.AddYears(-1),
                AvatarURL = "https://example.com/avatar.jpg"
            };

            var multiExam = new MultiExam
            {
                MultiExamId = 1,
                MultiExamName = "Bài thi trắc nghiệm",
                NumberQuestion = 15,
                StartDay = DateTime.Now.AddDays(1),
                EndDay = DateTime.Now.AddDays(2),
                Duration = 45,
                CreateAt = new DateTime(year, 3, 15),
                Status = "Published",
                CodeStart = "TEST001",
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                SubjectId = subjectId,
                Subject = subject,
                CategoryExamId = categoryExam.CategoryExamId,
                CategoryExam = categoryExam,
                SemesterId = semesterId,
                Semester = semester,
                ClassId = classEntity.ClassId,
                Class = classEntity,
                IsPublish = true
            };

            var multiExamHistory = new MultiExamHistory
            {
                ExamHistoryId = Guid.NewGuid(),
                StudentId = student.StudentId,
                StartTime = DateTime.Now.AddHours(-2),
                EndTime = DateTime.Now.AddHours(-1),
                Score = 9.0,
                StatusExam = PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM,
                MultiExam = multiExam,
                Student = student
            };

            // Thêm dữ liệu vào in-memory database
            _context.CategoryExams.Add(categoryExam);
            _context.Subjects.Add(subject);
            _context.Semesters.Add(semester);
            _context.Majors.Add(major);
            _context.Users.Add(user);
            _context.Users.Add(teacherUser);
            _context.Teachers.Add(teacher);
            _context.Classes.Add(classEntity);
            _context.Students.Add(student);
            _context.MultiExams.Add(multiExam);
            _context.MultiExamHistories.Add(multiExamHistory);
            await _context.SaveChangesAsync();

            // Act: Gọi method cần test
            var result = await _studentRepository.GetHistoryExamOfStudentBySubIdAsync(semesterId, year, subjectId, studentId);

            // Assert: Kiểm tra kết quả chỉ có bài thi trắc nghiệm
            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.Count);
            Assert.AreEqual("Multi", result[0].ExamType);
            Assert.AreEqual("Bài thi trắc nghiệm", result[0].ExamName);
            Assert.AreEqual(9.0, result[0].Score);
        }

        [Test]
        public async Task GetHistoryExamOfStudentBySubIdAsync_OnlyPracticeExams_ReturnsPracticeExamsOnly()
        {
            // Arrange: Chuẩn bị dữ liệu test chỉ có bài thi tự luận
            var studentId = Guid.NewGuid();
            var subjectId = 1;
            var semesterId = 1;
            var year = 2024;

            // Tạo dữ liệu test
            var categoryExam = new CategoryExam
            {
                CategoryExamId = 2,
                CategoryExamName = "Tự luận"
            };

            var subject = new Subject
            {
                SubjectId = subjectId,
                SubjectName = "Toán học",
                Description = "Môn học cơ bản về toán học",
                Course = "MATH101",
                NoCredits = 3
            };

            var semester = new Semester
            {
                SemesterId = semesterId,
                SemesterName = "Học kỳ 1",
                IsActive = true
            };

            var major = new Major
            {
                MajorId = 1,
                MajorName = "Công nghệ thông tin",
                StartDate = DateTime.Now.AddYears(-5),
                IsActive = true
            };

            var user = new User
            {
                Id = studentId,
                UserName = "testuser",
                Email = "test@example.com",
                Fullname = "Test User"
            };

            var teacherUser = new User
            {
                Id = Guid.NewGuid(),
                UserName = "teacher",
                Email = "teacher@example.com",
                Fullname = "Test Teacher"
            };

            var teacher = new Teacher
            {
                TeacherId = Guid.NewGuid(),
                UserId = teacherUser.Id,
                User = teacherUser,
                HireDate = DateTime.Now.AddYears(-2),
                MajorId = major.MajorId,
                Major = major,
                IsHeadOfDepartment = false,
                IsExamManager = false
            };

            var classEntity = new Class
            {
                ClassId = 1,
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                SubjectId = subjectId,
                Subject = subject,
                SemesterId = semesterId,
                Semester = semester,
                ClassName = "Lớp Toán 1",
                CreatedDate = DateTime.Now.AddMonths(-2)
            };

            var student = new Student
            {
                StudentId = Guid.NewGuid(),
                UserId = studentId,
                User = user,
                EnrollDate = DateTime.Now.AddYears(-1),
                AvatarURL = "https://example.com/avatar.jpg"
            };

            var practiceExam = new PracticeExam
            {
                PracExamId = 1,
                PracExamName = "Bài thi tự luận",
                Duration = 120,
                StartDay = DateTime.Now.AddDays(1),
                EndDay = DateTime.Now.AddDays(2),
                CreateAt = new DateTime(year, 3, 15),
                Status = "Published",
                CodeStart = "TEST001",
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                CategoryExamId = categoryExam.CategoryExamId,
                CategoryExam = categoryExam,
                SubjectId = subjectId,
                Subject = subject,
                SemesterId = semesterId,
                Semester = semester,
                ClassId = classEntity.ClassId,
                Class = classEntity
            };

            var practiceExamHistory = new PracticeExamHistory
            {
                PracExamHistoryId = Guid.NewGuid(),
                StudentId = student.StudentId,
                StartTime = DateTime.Now.AddDays(-1).AddHours(-3),
                EndTime = DateTime.Now.AddDays(-1).AddHours(-1),
                Score = 8.2,
                StatusExam = PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM,
                PracticeExam = practiceExam,
                Student = student
            };

            // Thêm dữ liệu vào in-memory database
            _context.CategoryExams.Add(categoryExam);
            _context.Subjects.Add(subject);
            _context.Semesters.Add(semester);
            _context.Majors.Add(major);
            _context.Users.Add(user);
            _context.Users.Add(teacherUser);
            _context.Teachers.Add(teacher);
            _context.Classes.Add(classEntity);
            _context.Students.Add(student);
            _context.PracticeExams.Add(practiceExam);
            _context.PracticeExamHistories.Add(practiceExamHistory);
            await _context.SaveChangesAsync();

            // Act: Gọi method cần test
            var result = await _studentRepository.GetHistoryExamOfStudentBySubIdAsync(semesterId, year, subjectId, studentId);

            // Assert: Kiểm tra kết quả chỉ có bài thi tự luận
            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.Count);
            Assert.AreEqual("Practice", result[0].ExamType);
            Assert.AreEqual("Bài thi tự luận", result[0].ExamName);
            Assert.AreEqual(8.2, result[0].Score);
        }

        [Test]
        public async Task GetHistoryExamOfStudentBySubIdAsync_ExcludeIncompleteExams_ReturnsOnlyCompletedExams()
        {
            // Arrange: Chuẩn bị dữ liệu test có cả bài thi hoàn thành và chưa hoàn thành
            var studentId = Guid.NewGuid();
            var subjectId = 1;
            var semesterId = 1;
            var year = 2024;

            // Tạo dữ liệu test
            var categoryExam = new CategoryExam
            {
                CategoryExamId = 1,
                CategoryExamName = "Giữa kỳ"
            };

            var subject = new Subject
            {
                SubjectId = subjectId,
                SubjectName = "Toán học",
                Description = "Môn học cơ bản về toán học",
                Course = "MATH101",
                NoCredits = 3
            };

            var semester = new Semester
            {
                SemesterId = semesterId,
                SemesterName = "Học kỳ 1",
                IsActive = true
            };

            var major = new Major
            {
                MajorId = 1,
                MajorName = "Công nghệ thông tin",
                StartDate = DateTime.Now.AddYears(-5),
                IsActive = true
            };

            var user = new User
            {
                Id = studentId,
                UserName = "testuser",
                Email = "test@example.com",
                Fullname = "Test User"
            };

            var teacherUser = new User
            {
                Id = Guid.NewGuid(),
                UserName = "teacher",
                Email = "teacher@example.com",
                Fullname = "Test Teacher"
            };

            var teacher = new Teacher
            {
                TeacherId = Guid.NewGuid(),
                UserId = teacherUser.Id,
                User = teacherUser,
                HireDate = DateTime.Now.AddYears(-2),
                MajorId = major.MajorId,
                Major = major,
                IsHeadOfDepartment = false,
                IsExamManager = false
            };

            var classEntity = new Class
            {
                ClassId = 1,
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                SubjectId = subjectId,
                Subject = subject,
                SemesterId = semesterId,
                Semester = semester,
                ClassName = "Lớp Toán 1",
                CreatedDate = DateTime.Now.AddMonths(-2)
            };

            var student = new Student
            {
                StudentId = Guid.NewGuid(),
                UserId = studentId,
                User = user,
                EnrollDate = DateTime.Now.AddYears(-1),
                AvatarURL = "https://example.com/avatar.jpg"
            };

            var multiExam = new MultiExam
            {
                MultiExamId = 1,
                MultiExamName = "Bài thi hoàn thành",
                NumberQuestion = 20,
                StartDay = DateTime.Now.AddDays(1),
                EndDay = DateTime.Now.AddDays(2),
                Duration = 60,
                CreateAt = new DateTime(year, 3, 15),
                Status = "Published",
                CodeStart = "TEST001",
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                SubjectId = subjectId,
                Subject = subject,
                CategoryExamId = categoryExam.CategoryExamId,
                CategoryExam = categoryExam,
                SemesterId = semesterId,
                Semester = semester,
                ClassId = classEntity.ClassId,
                Class = classEntity,
                IsPublish = true
            };

            var multiExamHistory1 = new MultiExamHistory
            {
                ExamHistoryId = Guid.NewGuid(),
                StudentId = student.StudentId,
                StartTime = DateTime.Now.AddHours(-2),
                EndTime = DateTime.Now.AddHours(-1),
                Score = 8.5,
                StatusExam = PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM, // Hoàn thành
                MultiExam = multiExam,
                Student = student
            };

            var multiExamHistory2 = new MultiExamHistory
            {
                ExamHistoryId = Guid.NewGuid(),
                StudentId = student.StudentId,
                StartTime = DateTime.Now.AddHours(-1),
                EndTime = null, // Chưa hoàn thành
                Score = null,
                StatusExam = PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM, // Đang làm
                MultiExam = multiExam,
                Student = student
            };

            // Thêm dữ liệu vào in-memory database
            _context.CategoryExams.Add(categoryExam);
            _context.Subjects.Add(subject);
            _context.Semesters.Add(semester);
            _context.Majors.Add(major);
            _context.Users.Add(user);
            _context.Users.Add(teacherUser);
            _context.Teachers.Add(teacher);
            _context.Classes.Add(classEntity);
            _context.Students.Add(student);
            _context.MultiExams.Add(multiExam);
            _context.MultiExamHistories.Add(multiExamHistory1);
            _context.MultiExamHistories.Add(multiExamHistory2);
            await _context.SaveChangesAsync();

            // Act: Gọi method cần test
            var result = await _studentRepository.GetHistoryExamOfStudentBySubIdAsync(semesterId, year, subjectId, studentId);

            // Assert: Kiểm tra kết quả chỉ có bài thi hoàn thành
            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.Count);
            Assert.AreEqual("Bài thi hoàn thành", result[0].ExamName);
        }

        [Test]
        public async Task GetHistoryExamOfStudentBySubIdAsync_OrderBySubmittedDateTime_ReturnsCorrectOrder()
        {
            // Arrange: Chuẩn bị dữ liệu test với thời gian nộp khác nhau
            var studentId = Guid.NewGuid();
            var subjectId = 1;
            var semesterId = 1;
            var year = 2024;

            // Tạo dữ liệu test
            var categoryExam1 = new CategoryExam
            {
                CategoryExamId = 1,
                CategoryExamName = "Kiểm tra"
            };

            var categoryExam2 = new CategoryExam
            {
                CategoryExamId = 2,
                CategoryExamName = "Tự luận"
            };

            var subject = new Subject
            {
                SubjectId = subjectId,
                SubjectName = "Toán học",
                Description = "Môn học cơ bản về toán học",
                Course = "MATH101",
                NoCredits = 3
            };

            var semester = new Semester
            {
                SemesterId = semesterId,
                SemesterName = "Học kỳ 1",
                IsActive = true
            };

            var major = new Major
            {
                MajorId = 1,
                MajorName = "Công nghệ thông tin",
                StartDate = DateTime.Now.AddYears(-5),
                IsActive = true
            };

            var user = new User
            {
                Id = studentId,
                UserName = "testuser",
                Email = "test@example.com",
                Fullname = "Test User"
            };

            var teacherUser = new User
            {
                Id = Guid.NewGuid(),
                UserName = "teacher",
                Email = "teacher@example.com",
                Fullname = "Test Teacher"
            };

            var teacher = new Teacher
            {
                TeacherId = Guid.NewGuid(),
                UserId = teacherUser.Id,
                User = teacherUser,
                HireDate = DateTime.Now.AddYears(-2),
                MajorId = major.MajorId,
                Major = major,
                IsHeadOfDepartment = false,
                IsExamManager = false
            };

            var classEntity = new Class
            {
                ClassId = 1,
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                SubjectId = subjectId,
                Subject = subject,
                SemesterId = semesterId,
                Semester = semester,
                ClassName = "Lớp Toán 1",
                CreatedDate = DateTime.Now.AddMonths(-2)
            };

            var student = new Student
            {
                StudentId = Guid.NewGuid(),
                UserId = studentId,
                User = user,
                EnrollDate = DateTime.Now.AddYears(-1),
                AvatarURL = "https://example.com/avatar.jpg"
            };

            var multiExam = new MultiExam
            {
                MultiExamId = 1,
                MultiExamName = "Bài thi đầu tiên",
                NumberQuestion = 20,
                StartDay = DateTime.Now.AddDays(1),
                EndDay = DateTime.Now.AddDays(2),
                Duration = 60,
                CreateAt = new DateTime(year, 3, 10),
                Status = "Published",
                CodeStart = "TEST001",
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                SubjectId = subjectId,
                Subject = subject,
                CategoryExamId = categoryExam1.CategoryExamId,
                CategoryExam = categoryExam1,
                SemesterId = semesterId,
                Semester = semester,
                ClassId = classEntity.ClassId,
                Class = classEntity,
                IsPublish = true
            };

            var practiceExam = new PracticeExam
            {
                PracExamId = 2,
                PracExamName = "Bài thi cuối cùng",
                Duration = 90,
                StartDay = DateTime.Now.AddDays(5),
                EndDay = DateTime.Now.AddDays(6),
                CreateAt = new DateTime(year, 3, 15),
                Status = "Published",
                CodeStart = "TEST002",
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                CategoryExamId = categoryExam2.CategoryExamId,
                CategoryExam = categoryExam2,
                SubjectId = subjectId,
                Subject = subject,
                SemesterId = semesterId,
                Semester = semester,
                ClassId = classEntity.ClassId,
                Class = classEntity
            };

            var multiExamHistory = new MultiExamHistory
            {
                ExamHistoryId = Guid.NewGuid(),
                StudentId = student.StudentId,
                StartTime = DateTime.Now.AddDays(-3).AddHours(-2),
                EndTime = DateTime.Now.AddDays(-3).AddHours(-1), // Nộp sớm nhất
                Score = 8.0,
                StatusExam = PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM,
                MultiExam = multiExam,
                Student = student
            };

            var practiceExamHistory = new PracticeExamHistory
            {
                PracExamHistoryId = Guid.NewGuid(),
                StudentId = student.StudentId,
                StartTime = DateTime.Now.AddDays(-1).AddHours(-3),
                EndTime = DateTime.Now.AddDays(-1).AddHours(-1), // Nộp muộn nhất
                Score = 9.0,
                StatusExam = PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM,
                PracticeExam = practiceExam,
                Student = student
            };

            // Thêm dữ liệu vào in-memory database
            _context.CategoryExams.Add(categoryExam1);
            _context.CategoryExams.Add(categoryExam2);
            _context.Subjects.Add(subject);
            _context.Semesters.Add(semester);
            _context.Majors.Add(major);
            _context.Users.Add(user);
            _context.Users.Add(teacherUser);
            _context.Teachers.Add(teacher);
            _context.Classes.Add(classEntity);
            _context.Students.Add(student);
            _context.MultiExams.Add(multiExam);
            _context.PracticeExams.Add(practiceExam);
            _context.MultiExamHistories.Add(multiExamHistory);
            _context.PracticeExamHistories.Add(practiceExamHistory);
            await _context.SaveChangesAsync();

            // Act: Gọi method cần test
            var result = await _studentRepository.GetHistoryExamOfStudentBySubIdAsync(semesterId, year, subjectId, studentId);

            // Assert: Kiểm tra kết quả được sắp xếp theo thời gian nộp
            Assert.IsNotNull(result);
            Assert.AreEqual(2, result.Count);
            
            // Bài thi đầu tiên phải có thời gian nộp sớm hơn
            Assert.IsTrue(result[0].SubmittedDateTime < result[1].SubmittedDateTime);
            Assert.AreEqual("Bài thi đầu tiên", result[0].ExamName);
            Assert.AreEqual("Bài thi cuối cùng", result[1].ExamName);
        }
    }
} 