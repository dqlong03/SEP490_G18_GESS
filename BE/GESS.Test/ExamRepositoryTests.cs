using NUnit.Framework;
using GESS.Repository.Implement;
using GESS.Entity.Contexts;
using GESS.Model.Exam;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GESS.Entity.Entities;
using FluentAssertions;
using GESS.Common;

namespace GESS.Test
{
    [TestFixture]
    public class ExamRepositoryTests
    {
        private GessDbContext _context;
        private ExamRepository _repo;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<GessDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new GessDbContext(options);
            _repo = new ExamRepository(_context);
        }

        [TearDown]
        public void TearDown()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        

        [Test]
        public async Task GetAllMultiExamOfStudentAsync_WhenStudentHasPendingExams_ReturnsCorrectExams()
        {
            // Arrange
            var studentId = Guid.NewGuid();
            var currentYear = DateTime.Now.Year;

            // Tạo dữ liệu cơ bản
            var subject = new Subject 
            { 
                SubjectId = 1, 
                SubjectName = "Toán học",
                Description = "Môn học về toán học cơ bản",
                Course = "MATH101",
                NoCredits = 3
            };
            var semester = new Semester { SemesterId = 1, SemesterName = "2024A", IsActive = true };
            var categoryExam = new CategoryExam { CategoryExamId = 1, CategoryExamName = "Thi giữa kỳ" };
            
            // Tạo User cho Teacher
            var teacherUser = new User 
            { 
                Id = Guid.NewGuid(),
                UserName = "teacher1",
                Email = "teacher1@fpt.edu.vn",
                Fullname = "Giáo viên Toán",
                IsActive = true
            };
            
            // Tạo Major cho Teacher
            var major = new Major 
            { 
                MajorId = 1, 
                MajorName = "Công nghệ thông tin",
                StartDate = DateTime.Now.AddYears(-5),
                IsActive = true
            };
            
            var teacher = new Teacher 
            { 
                TeacherId = Guid.NewGuid(),
                UserId = teacherUser.Id,
                User = teacherUser,
                MajorId = major.MajorId,
                Major = major,
                HireDate = DateTime.Now.AddYears(-2)
            };
            
            // Tạo User cho Student
            var studentUser = new User 
            { 
                Id = Guid.NewGuid(),
                UserName = "student1",
                Email = "student1@fpt.edu.vn",
                Fullname = "Sinh viên Test",
                IsActive = true
            };
            
            var student = new Student 
            { 
                StudentId = studentId, 
                UserId = studentUser.Id,
                User = studentUser,
                EnrollDate = DateTime.Now.AddYears(-1),
                AvatarURL = "https://example.com/avatar.jpg"
            };

            // Tạo Class cho MultiExam
            var classEntity = new Class
            {
                ClassId = 1,
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                SubjectId = subject.SubjectId,
                Subject = subject,
                SemesterId = semester.SemesterId,
                Semester = semester,
                ClassName = "Lớp Toán 1",
                CreatedDate = DateTime.Now.AddMonths(-2)
            };

            // Tạo MultiExam với năm và học kỳ mới nhất
            var multiExam = new MultiExam
            {
                MultiExamId = 1,
                MultiExamName = "Bài thi giữa kỳ Toán",
                NumberQuestion = 20,
                StartDay = DateTime.Now.AddDays(1),
                EndDay = DateTime.Now.AddDays(2),
                SubjectId = subject.SubjectId,
                Subject = subject,
                SemesterId = semester.SemesterId,
                Semester = semester,
                CategoryExamId = categoryExam.CategoryExamId,
                CategoryExam = categoryExam,
                Duration = 60,
                Status = PredefinedStatusAllExam.ONHOLD_EXAM, // "Chưa mở ca"
                CreateAt = new DateTime(currentYear, 3, 15), // Năm hiện tại
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                ClassId = classEntity.ClassId,
                Class = classEntity
            };

            // Tạo MultiExamHistory với trạng thái pending
            var multiExamHistory = new MultiExamHistory
            {
                ExamHistoryId = Guid.NewGuid(),
                MultiExamId = multiExam.MultiExamId,
                MultiExam = multiExam,
                StudentId = studentId,
                Student = student,
                StatusExam = PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM, // "Chưa thi"
                CheckIn = true
            };

            // Thêm dữ liệu vào context
            _context.Users.AddRange(teacherUser, studentUser);
            _context.Majors.Add(major);
            _context.Subjects.Add(subject);
            _context.Semesters.Add(semester);
            _context.CategoryExams.Add(categoryExam);
            _context.Teachers.Add(teacher);
            _context.Students.Add(student);
            _context.MultiExams.Add(multiExam);
            _context.MultiExamHistories.Add(multiExamHistory);
            await _context.SaveChangesAsync();

            var request = new ExamFilterRequest { StudentId = studentId };

            // Act
            var result = await _repo.GetAllMultiExamOfStudentAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            result[0].ExamId.Should().Be(1);
            result[0].ExamName.Should().Be("Bài thi giữa kỳ Toán");
            result[0].SubjectName.Should().Be("Toán học");
            result[0].Duration.Should().Be(60);
            result[0].Status.Should().Be(PredefinedStatusAllExam.ONHOLD_EXAM);
        }

        [Test]
        public async Task GetAllMultiExamOfStudentAsync_WhenStudentHasInProgressExams_ReturnsCorrectExams()
        {
            // Arrange
            var studentId = Guid.NewGuid();
            var currentYear = DateTime.Now.Year;

            // Tạo dữ liệu cơ bản
            var subject = new Subject 
            { 
                SubjectId = 1, 
                SubjectName = "Vật lý",
                Description = "Môn học về vật lý cơ bản",
                Course = "PHY101",
                NoCredits = 3
            };
            var semester = new Semester { SemesterId = 1, SemesterName = "2024A", IsActive = true };
            var categoryExam = new CategoryExam { CategoryExamId = 1, CategoryExamName = "Thi cuối kỳ" };
            
            // Tạo User cho Teacher
            var teacherUser = new User 
            { 
                Id = Guid.NewGuid(),
                UserName = "teacher2",
                Email = "teacher2@fpt.edu.vn",
                Fullname = "Giáo viên Vật lý",
                IsActive = true
            };
            
            // Tạo Major cho Teacher
            var major = new Major 
            { 
                MajorId = 1, 
                MajorName = "Công nghệ thông tin",
                StartDate = DateTime.Now.AddYears(-5),
                IsActive = true
            };
            
            var teacher = new Teacher 
            { 
                TeacherId = Guid.NewGuid(),
                UserId = teacherUser.Id,
                User = teacherUser,
                MajorId = major.MajorId,
                Major = major,
                HireDate = DateTime.Now.AddYears(-2)
            };
            
            // Tạo User cho Student
            var studentUser = new User 
            { 
                Id = Guid.NewGuid(),
                UserName = "student2",
                Email = "student2@fpt.edu.vn",
                Fullname = "Sinh viên Test 2",
                IsActive = true
            };
            
            var student = new Student 
            { 
                StudentId = studentId, 
                UserId = studentUser.Id,
                User = studentUser,
                EnrollDate = DateTime.Now.AddYears(-1),
                AvatarURL = "https://example.com/avatar.jpg"
            };

            // Tạo Class cho MultiExam
            var classEntity = new Class
            {
                ClassId = 1,
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                SubjectId = subject.SubjectId,
                Subject = subject,
                SemesterId = semester.SemesterId,
                Semester = semester,
                ClassName = "Lớp Vật lý 1",
                CreatedDate = DateTime.Now.AddMonths(-2)
            };

            // Tạo MultiExam với trạng thái đang mở
            var multiExam = new MultiExam
            {
                MultiExamId = 1,
                MultiExamName = "Bài thi cuối kỳ Vật lý",
                NumberQuestion = 25,
                StartDay = DateTime.Now.AddDays(1),
                EndDay = DateTime.Now.AddDays(2),
                SubjectId = subject.SubjectId,
                Subject = subject,
                SemesterId = semester.SemesterId,
                Semester = semester,
                CategoryExamId = categoryExam.CategoryExamId,
                CategoryExam = categoryExam,
                Duration = 90,
                Status = PredefinedStatusAllExam.OPENING_EXAM, // "Đang mở ca"
                CreateAt = new DateTime(currentYear, 6, 20), // Năm hiện tại
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                ClassId = classEntity.ClassId,
                Class = classEntity
            };

            // Tạo MultiExamHistory với trạng thái đang thi
            var multiExamHistory = new MultiExamHistory
            {
                ExamHistoryId = Guid.NewGuid(),
                MultiExamId = multiExam.MultiExamId,
                MultiExam = multiExam,
                StudentId = studentId,
                Student = student,
                StatusExam = PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM, // "Đang thi"
                CheckIn = true,
                StartTime = DateTime.Now.AddMinutes(-30) // Bắt đầu 30 phút trước
            };

            // Thêm dữ liệu vào context
            _context.Users.AddRange(teacherUser, studentUser);
            _context.Majors.Add(major);
            _context.Subjects.Add(subject);
            _context.Semesters.Add(semester);
            _context.CategoryExams.Add(categoryExam);
            _context.Teachers.Add(teacher);
            _context.Students.Add(student);
            _context.MultiExams.Add(multiExam);
            _context.MultiExamHistories.Add(multiExamHistory);
            await _context.SaveChangesAsync();

            var request = new ExamFilterRequest { StudentId = studentId };

            // Act
            var result = await _repo.GetAllMultiExamOfStudentAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            result[0].ExamId.Should().Be(1);
            result[0].ExamName.Should().Be("Bài thi cuối kỳ Vật lý");
            result[0].SubjectName.Should().Be("Vật lý");
            result[0].Duration.Should().Be(90);
            result[0].Status.Should().Be(PredefinedStatusAllExam.OPENING_EXAM);
        }

        [Test]
        public async Task GetAllMultiExamOfStudentAsync_WhenStudentHasCompletedExams_ReturnsEmptyList()
        {
            // Arrange
            var studentId = Guid.NewGuid();
            var currentYear = DateTime.Now.Year;

            // Tạo dữ liệu cơ bản
            var subject = new Subject 
            { 
                SubjectId = 1, 
                SubjectName = "Hóa học",
                Description = "Môn học về hóa học cơ bản",
                Course = "CHEM101",
                NoCredits = 3
            };
            var semester = new Semester { SemesterId = 1, SemesterName = "2024A", IsActive = true };
            var categoryExam = new CategoryExam { CategoryExamId = 1, CategoryExamName = "Thi giữa kỳ" };
            
            // Tạo User cho Teacher
            var teacherUser = new User 
            { 
                Id = Guid.NewGuid(),
                UserName = "teacher3",
                Email = "teacher3@fpt.edu.vn",
                Fullname = "Giáo viên Hóa học",
                IsActive = true
            };
            
            // Tạo Major cho Teacher
            var major = new Major 
            { 
                MajorId = 1, 
                MajorName = "Công nghệ thông tin",
                StartDate = DateTime.Now.AddYears(-5),
                IsActive = true
            };
            
            var teacher = new Teacher 
            { 
                TeacherId = Guid.NewGuid(),
                UserId = teacherUser.Id,
                User = teacherUser,
                MajorId = major.MajorId,
                Major = major,
                HireDate = DateTime.Now.AddYears(-2)
            };
            
            // Tạo User cho Student
            var studentUser = new User 
            { 
                Id = Guid.NewGuid(),
                UserName = "student3",
                Email = "student3@fpt.edu.vn",
                Fullname = "Sinh viên Test 3",
                IsActive = true
            };
            
            var student = new Student 
            { 
                StudentId = studentId, 
                UserId = studentUser.Id,
                User = studentUser,
                EnrollDate = DateTime.Now.AddYears(-1),
                AvatarURL = "https://example.com/avatar.jpg"
            };

            // Tạo Class cho MultiExam
            var classEntity = new Class
            {
                ClassId = 1,
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                SubjectId = subject.SubjectId,
                Subject = subject,
                SemesterId = semester.SemesterId,
                Semester = semester,
                ClassName = "Lớp Hóa học 1",
                CreatedDate = DateTime.Now.AddMonths(-2)
            };

            // Tạo MultiExam với trạng thái đã đóng
            var multiExam = new MultiExam
            {
                MultiExamId = 1,
                MultiExamName = "Bài thi giữa kỳ Hóa học",
                NumberQuestion = 20,
                StartDay = DateTime.Now.AddDays(-5),
                EndDay = DateTime.Now.AddDays(-4),
                SubjectId = subject.SubjectId,
                Subject = subject,
                SemesterId = semester.SemesterId,
                Semester = semester,
                CategoryExamId = categoryExam.CategoryExamId,
                CategoryExam = categoryExam,
                Duration = 60,
                Status = PredefinedStatusAllExam.CLOSED_EXAM, // "Đã đóng ca"
                CreateAt = new DateTime(currentYear, 3, 15),
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                ClassId = classEntity.ClassId,
                Class = classEntity
            };

            // Tạo MultiExamHistory với trạng thái đã thi
            var multiExamHistory = new MultiExamHistory
            {
                ExamHistoryId = Guid.NewGuid(),
                MultiExamId = multiExam.MultiExamId,
                MultiExam = multiExam,
                StudentId = studentId,
                Student = student,
                StatusExam = PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM, // "Đã thi"
                CheckIn = true,
                StartTime = DateTime.Now.AddHours(-2),
                EndTime = DateTime.Now.AddHours(-1),
                Score = 8.5
            };

            // Thêm dữ liệu vào context
            _context.Users.AddRange(teacherUser, studentUser);
            _context.Majors.Add(major);
            _context.Subjects.Add(subject);
            _context.Semesters.Add(semester);
            _context.CategoryExams.Add(categoryExam);
            _context.Teachers.Add(teacher);
            _context.Students.Add(student);
            _context.MultiExams.Add(multiExam);
            _context.MultiExamHistories.Add(multiExamHistory);
            await _context.SaveChangesAsync();

            var request = new ExamFilterRequest { StudentId = studentId };

            // Act
            var result = await _repo.GetAllMultiExamOfStudentAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty(); // Không trả về bài thi đã hoàn thành
        }

        [Test]
        public async Task GetAllMultiExamOfStudentAsync_WhenStudentHasExamsFromDifferentYears_ReturnsOnlyLatestYearExams()
        {
            // Arrange
            var studentId = Guid.NewGuid();
            var currentYear = DateTime.Now.Year;
            var previousYear = currentYear - 1;

            // Tạo dữ liệu cơ bản
            var subject = new Subject 
            { 
                SubjectId = 1, 
                SubjectName = "Sinh học",
                Description = "Môn học về sinh học cơ bản",
                Course = "BIO101",
                NoCredits = 3
            };
            var semester = new Semester { SemesterId = 1, SemesterName = "2024A", IsActive = true };
            var categoryExam = new CategoryExam { CategoryExamId = 1, CategoryExamName = "Thi cuối kỳ" };
            
            // Tạo User cho Teacher
            var teacherUser = new User 
            { 
                Id = Guid.NewGuid(),
                UserName = "teacher4",
                Email = "teacher4@fpt.edu.vn",
                Fullname = "Giáo viên Sinh học",
                IsActive = true
            };
            
            // Tạo Major cho Teacher
            var major = new Major 
            { 
                MajorId = 1, 
                MajorName = "Công nghệ thông tin",
                StartDate = DateTime.Now.AddYears(-5),
                IsActive = true
            };
            
            var teacher = new Teacher 
            { 
                TeacherId = Guid.NewGuid(),
                UserId = teacherUser.Id,
                User = teacherUser,
                MajorId = major.MajorId,
                Major = major,
                HireDate = DateTime.Now.AddYears(-2)
            };
            
            // Tạo User cho Student
            var studentUser = new User 
            { 
                Id = Guid.NewGuid(),
                UserName = "student4",
                Email = "student4@fpt.edu.vn",
                Fullname = "Sinh viên Test 4",
                IsActive = true
            };
            
            var student = new Student 
            { 
                StudentId = studentId, 
                UserId = studentUser.Id,
                User = studentUser,
                EnrollDate = DateTime.Now.AddYears(-1),
                AvatarURL = "https://example.com/avatar.jpg"
            };

            // Tạo Class cho MultiExam
            var classEntity = new Class
            {
                ClassId = 1,
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                SubjectId = subject.SubjectId,
                Subject = subject,
                SemesterId = semester.SemesterId,
                Semester = semester,
                ClassName = "Lớp Sinh học 1",
                CreatedDate = DateTime.Now.AddMonths(-2)
            };

            // Tạo MultiExam từ năm trước (không nên trả về)
            var oldMultiExam = new MultiExam
            {
                MultiExamId = 1,
                MultiExamName = "Bài thi năm trước",
                NumberQuestion = 20,
                StartDay = DateTime.Now.AddDays(-365),
                EndDay = DateTime.Now.AddDays(-364),
                SubjectId = subject.SubjectId,
                Subject = subject,
                SemesterId = semester.SemesterId,
                Semester = semester,
                CategoryExamId = categoryExam.CategoryExamId,
                CategoryExam = categoryExam,
                Duration = 60,
                Status = PredefinedStatusAllExam.ONHOLD_EXAM,
                CreateAt = new DateTime(previousYear, 6, 20), // Năm trước
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                ClassId = classEntity.ClassId,
                Class = classEntity
            };

            // Tạo MultiExam từ năm hiện tại (nên trả về)
            var currentMultiExam = new MultiExam
            {
                MultiExamId = 2,
                MultiExamName = "Bài thi năm hiện tại",
                NumberQuestion = 30,
                StartDay = DateTime.Now.AddDays(1),
                EndDay = DateTime.Now.AddDays(2),
                SubjectId = subject.SubjectId,
                Subject = subject,
                SemesterId = semester.SemesterId,
                Semester = semester,
                CategoryExamId = categoryExam.CategoryExamId,
                CategoryExam = categoryExam,
                Duration = 90,
                Status = PredefinedStatusAllExam.ONHOLD_EXAM,
                CreateAt = new DateTime(currentYear, 6, 20), // Năm hiện tại
                TeacherId = teacher.TeacherId,
                Teacher = teacher,
                ClassId = classEntity.ClassId,
                Class = classEntity
            };

            // Tạo MultiExamHistory cho bài thi cũ
            var oldMultiExamHistory = new MultiExamHistory
            {
                ExamHistoryId = Guid.NewGuid(),
                MultiExamId = oldMultiExam.MultiExamId,
                MultiExam = oldMultiExam,
                StudentId = studentId,
                Student = student,
                StatusExam = PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM,
                CheckIn = true
            };

            // Tạo MultiExamHistory cho bài thi hiện tại
            var currentMultiExamHistory = new MultiExamHistory
            {
                ExamHistoryId = Guid.NewGuid(),
                MultiExamId = currentMultiExam.MultiExamId,
                MultiExam = currentMultiExam,
                StudentId = studentId,
                Student = student,
                StatusExam = PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM,
                CheckIn = true
            };

            // Thêm dữ liệu vào context
            _context.Users.AddRange(teacherUser, studentUser);
            _context.Majors.Add(major);
            _context.Subjects.Add(subject);
            _context.Semesters.Add(semester);
            _context.CategoryExams.Add(categoryExam);
            _context.Teachers.Add(teacher);
            _context.Students.Add(student);
            _context.Classes.Add(classEntity);
            _context.MultiExams.AddRange(oldMultiExam, currentMultiExam);
            _context.MultiExamHistories.AddRange(oldMultiExamHistory, currentMultiExamHistory);
            await _context.SaveChangesAsync();

            var request = new ExamFilterRequest { StudentId = studentId };

            // Act
            var result = await _repo.GetAllMultiExamOfStudentAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1); // Chỉ trả về 1 bài thi từ năm hiện tại
            result[0].ExamId.Should().Be(2); // Bài thi từ năm hiện tại
            result[0].ExamName.Should().Be("Bài thi năm hiện tại");
            result[0].SubjectName.Should().Be("Sinh học");
            result[0].Duration.Should().Be(90);
        }
        // =====================================================================
        // CÁC BÀI TEST MỚI CHO GetAllPracExamOfStudentAsync (ĐÃ SỬA LẠI)
        // =====================================================================

        [Test]
        public async Task GetAllPracExamOfStudentAsync_StudentHasPendingExamInLatestSemester_ReturnsCorrectExam()
        {
            // Arrange
            var studentId = Guid.NewGuid();
            var currentYear = DateTime.Now.Year;

            // 1. Tạo các dữ liệu nền
            var subject = new Subject 
            { 
                SubjectId = 1, 
                SubjectName = "Toán rời rạc",
                Description = "Môn học về toán rời rạc",
                Course = "MATH201",
                NoCredits = 3
            };
            var semesterLatest = new Semester { SemesterId = 2, SemesterName = $"{currentYear}B", IsActive = true };
            var semesterOld = new Semester { SemesterId = 1, SemesterName = $"{currentYear}A", IsActive = true };
            var student = new Student 
            { 
                StudentId = studentId, 
                User = new User 
                { 
                    Id = Guid.NewGuid(),
                    UserName = "student_test1",
                    Email = "student1@fpt.edu.vn",
                    Fullname = "Sinh viên Test",
                    IsActive = true
                },
                EnrollDate = DateTime.Now.AddYears(-1),
                AvatarURL = "https://example.com/avatar.jpg"
            };

            // 2. Tạo bài thi hợp lệ trong kỳ mới nhất để kiểm tra
            var validExam = new PracticeExam
            {
                PracExamId = 101,
                PracExamName = "Bài luyện tập hợp lệ",
                SemesterId = semesterLatest.SemesterId,
                Semester = semesterLatest,
                SubjectId = subject.SubjectId,
                Subject = subject,
                Status = PredefinedStatusAllExam.ONHOLD_EXAM,
                CreateAt = new DateTime(currentYear, 8, 1),
                StartDay = DateTime.Now.AddDays(1),
                EndDay = DateTime.Now.AddDays(10),
                Duration = 60
            };
            var validHistory = new PracticeExamHistory
            {
                PracExamHistoryId = Guid.NewGuid(),
                PracExamId = validExam.PracExamId,
                StudentId = studentId,
                StatusExam = PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM
            };

            // 3. Tạo bài thi trong kỳ cũ (dự kiến sẽ bị lọc ra)
            var oldExam = new PracticeExam
            {
                PracExamId = 102,
                PracExamName = "Bài luyện tập cũ",
                SemesterId = semesterOld.SemesterId,
                Semester = semesterOld,
                SubjectId = subject.SubjectId,
                Subject = subject,
                Status = PredefinedStatusAllExam.ONHOLD_EXAM,
                CreateAt = new DateTime(currentYear, 4, 1),
                StartDay = DateTime.Now.AddDays(-30),
                EndDay = DateTime.Now.AddDays(-20),
                Duration = 60
            };
            var oldHistory = new PracticeExamHistory
            {
                PracExamHistoryId = Guid.NewGuid(),
                PracExamId = oldExam.PracExamId,
                StudentId = studentId,
                StatusExam = PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM
            };

            await _context.AddRangeAsync(subject, semesterLatest, semesterOld, student, validExam, validHistory, oldExam, oldHistory);
            await _context.SaveChangesAsync();

            var request = new ExamFilterRequest { StudentId = studentId };

            // Act
            var result = await _repo.GetAllPracExamOfStudentAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1); // Chỉ trả về bài thi của kỳ mới nhất
            result[0].ExamId.Should().Be(validExam.PracExamId);
            result[0].ExamName.Should().Be("Bài luyện tập hợp lệ");
        }

        [Test]
        public async Task GetAllPracExamOfStudentAsync_StudentHasCompletedExam_ReturnsEmptyList()
        {
            // Arrange
            var studentId = Guid.NewGuid();
            var currentYear = DateTime.Now.Year;
            var semester = new Semester { SemesterId = 1, SemesterName = $"{currentYear}A", IsActive = true };
            var subject = new Subject 
            { 
                SubjectId = 1, 
                SubjectName = "Toán",
                Description = "Môn học về toán cơ bản",
                Course = "MATH101",
                NoCredits = 3
            };
            var student = new Student 
            { 
                StudentId = studentId, 
                User = new User 
                { 
                    Id = Guid.NewGuid(),
                    UserName = "student_test2",
                    Email = "student2@fpt.edu.vn",
                    Fullname = "SV Test 2",
                    IsActive = true
                },
                EnrollDate = DateTime.Now.AddYears(-1),
                AvatarURL = "https://example.com/avatar.jpg"
            };

            // Tạo một kỳ thi mà sinh viên đã hoàn thành
            var completedExam = new PracticeExam
            {
                PracExamId = 201,
                PracExamName = "Bài thi đã hoàn thành",
                SemesterId = semester.SemesterId,
                Status = PredefinedStatusAllExam.OPENING_EXAM, // Trạng thái bài thi vẫn mở
                CreateAt = DateTime.Now,
                StartDay = DateTime.Now.AddDays(-5),
                EndDay = DateTime.Now.AddDays(5),
                Duration = 60
            };
            var completedHistory = new PracticeExamHistory
            {
                PracExamHistoryId = Guid.NewGuid(),
                PracExamId = completedExam.PracExamId,
                StudentId = studentId,
                // Nhưng trạng thái của sinh viên là "Đã thi"
                StatusExam = PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM
            };

            await _context.AddRangeAsync(semester, subject, student, completedExam, completedHistory);
            await _context.SaveChangesAsync();

            var request = new ExamFilterRequest { StudentId = studentId };

            // Act
            var result = await _repo.GetAllPracExamOfStudentAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty(); // Phải rỗng vì trạng thái lịch sử là "COMPLETED_EXAM"
        }

        [Test]
        public async Task GetAllPracExamOfStudentAsync_WhenPracticeExamStatusIsClosed_ReturnsEmptyList()
        {
            // Arrange
            var studentId = Guid.NewGuid();
            var currentYear = DateTime.Now.Year;
            var semester = new Semester { SemesterId = 1, SemesterName = $"{currentYear}A", IsActive = true };
            var subject = new Subject 
            { 
                SubjectId = 1, 
                SubjectName = "Toán",
                Description = "Môn học về toán cơ bản",
                Course = "MATH101",
                NoCredits = 3
            };
            var student = new Student 
            { 
                StudentId = studentId, 
                User = new User 
                { 
                    Id = Guid.NewGuid(),
                    UserName = "student_test3",
                    Email = "student3@fpt.edu.vn",
                    Fullname = "SV Test 3",
                    IsActive = true
                },
                EnrollDate = DateTime.Now.AddYears(-1),
                AvatarURL = "https://example.com/avatar.jpg"
            };

            // Trạng thái của chính bài thi là "Đã đóng"
            var closedExam = new PracticeExam
            {
                PracExamId = 301,
                PracExamName = "Bài thi đã đóng",
                SemesterId = semester.SemesterId,
                Status = PredefinedStatusAllExam.CLOSED_EXAM,
                CreateAt = DateTime.Now,
                StartDay = DateTime.Now.AddDays(-10),
                EndDay = DateTime.Now.AddDays(-5),
                Duration = 60
            };
            var history = new PracticeExamHistory
            {
                PracExamHistoryId = Guid.NewGuid(),
                PracExamId = closedExam.PracExamId,
                StudentId = studentId,
                StatusExam = PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM // Lịch sử thì vẫn đang chờ
            };

            await _context.AddRangeAsync(semester, subject, student, closedExam, history);
            await _context.SaveChangesAsync();

            var request = new ExamFilterRequest { StudentId = studentId };

            // Act
            var result = await _repo.GetAllPracExamOfStudentAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty(); // Phải rỗng vì trạng thái của bài thi là "CLOSED_EXAM"
        }

        [Test]
        public async Task GetAllPracExamOfStudentAsync_WhenStudentHasNoExamHistory_ReturnsEmptyList()
        {
            // Arrange
            var studentId = Guid.NewGuid(); // Sinh viên này không có bản ghi history nào
            var semester = new Semester { SemesterId = 1, SemesterName = $"{DateTime.Now.Year}A", IsActive = true };

            // Có một bài thi tồn tại, nhưng không được gán cho sinh viên (không có history)
            var examWithoutHistory = new PracticeExam
            {
                PracExamId = 401,
                PracExamName = "Bài thi không có lịch sử",
                SemesterId = semester.SemesterId,
                Status = PredefinedStatusAllExam.ONHOLD_EXAM,
                CreateAt = DateTime.Now,
                StartDay = DateTime.Now.AddDays(1),
                EndDay = DateTime.Now.AddDays(10),
                Duration = 60
            };

            await _context.AddRangeAsync(semester, examWithoutHistory);
            await _context.SaveChangesAsync();

            var request = new ExamFilterRequest { StudentId = studentId };

            // Act
            var result = await _repo.GetAllPracExamOfStudentAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty(); // Phải rỗng vì Inner Join với PracticeExamHistories không tìm thấy kết quả
        }

    }

} 