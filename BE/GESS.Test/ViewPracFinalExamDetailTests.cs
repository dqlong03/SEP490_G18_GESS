using NUnit.Framework;
using Microsoft.EntityFrameworkCore;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Implement;
using GESS.Model.PracticeExam;
using GESS.Model.PracticeExamPaper;
using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using System.Collections.Generic;

namespace GESS.Test
{
    [TestFixture]
    public class ViewPracFinalExamDetailTests
    {
        private GessDbContext _context;
        private FinaExamRepository _repository;

        [SetUp]
        public void Setup()
        {
            // Khởi tạo In-Memory Database cho testing
            var options = new DbContextOptionsBuilder<GessDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new GessDbContext(options);

            // Khởi tạo repository
            _repository = new FinaExamRepository(_context);

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
                IsActive = true,
            };
            _context.Semesters.Add(semester);

            // Tạo PracticeExamPaper
            var practiceExamPaper1 = new PracticeExamPaper
            {
                PracExamPaperId = 1,
                PracExamPaperName = "Đề thi cuối kỳ Web - Bài 1",
                SubjectId = 1,
                SemesterId = 1,
                CategoryExamId = 2,
                CreateAt = DateTime.Now,
                Status = "Active"
            };
            _context.PracticeExamPapers.Add(practiceExamPaper1);

            var practiceExamPaper2 = new PracticeExamPaper
            {
                PracExamPaperId = 2,
                PracExamPaperName = "Đề thi cuối kỳ Web - Bài 2",
                SubjectId = 1,
                SemesterId = 1,
                CategoryExamId = 2,
                CreateAt = DateTime.Now,
                Status = "Active"
            };
            _context.PracticeExamPapers.Add(practiceExamPaper2);

            var practiceExamPaper3 = new PracticeExamPaper
            {
                PracExamPaperId = 3,
                PracExamPaperName = "Đề thi cuối kỳ Web - Bài 3",
                SubjectId = 1,
                SemesterId = 1,
                CategoryExamId = 2,
                CreateAt = DateTime.Now,
                Status = "Active"
            };
            _context.PracticeExamPapers.Add(practiceExamPaper3);

            // Tạo PracticeExam
            var practiceExam = new PracticeExam
            {
                PracExamId = 1,
                PracExamName = "Kỳ thi cuối kỳ Web",
                SubjectId = 1,
                Duration = 120,
                StartDay = DateTime.Now.AddDays(7),
                EndDay = DateTime.Now.AddDays(7).AddHours(2),
                CategoryExamId = 2, // Final exam
                SemesterId = 1,
                TeacherId = teacher.TeacherId,
                CreateAt = DateTime.Now,
                ClassId = 1,
            };
            _context.PracticeExams.Add(practiceExam);

            // Tạo NoPEPaperInPE (liên kết PracticeExam với PracticeExamPaper)
            var noPEPaperInPE1 = new NoPEPaperInPE
            {
                PracExamId = 1,
                PracExamPaperId = 1
            };
            _context.NoPEPaperInPEs.Add(noPEPaperInPE1);

            var noPEPaperInPE2 = new NoPEPaperInPE
            {
                PracExamId = 1,
                PracExamPaperId = 2
            };
            _context.NoPEPaperInPEs.Add(noPEPaperInPE2);

            var noPEPaperInPE3 = new NoPEPaperInPE
            {
                PracExamId = 1,
                PracExamPaperId = 3
            };
            _context.NoPEPaperInPEs.Add(noPEPaperInPE3);

            _context.SaveChanges();
        }

        [Test]
        public async Task ViewPracFinalExamDetail_TestCase1_ValidExamId_ReturnsExamDetail()
        {
            // Arrange
            var validExamId = 1;

            // Act
            var result = await _repository.ViewPracFinalExamDetail(validExamId);

            // Assert
            result.Should().NotBeNull();
            result.ExamId.Should().Be(1);
            result.PracExamName.Should().Be("Kỳ thi cuối kỳ Web");
            result.SubjectId.Should().Be(1);
            result.SubjectName.Should().Be("Lập trình Web");
            result.SemesterId.Should().Be(1);
            result.SemesterName.Should().Be("Học kỳ 1");
            result.TeacherId.Should().NotBeEmpty();
            result.TeacherName.Should().Be("Giáo viên 1");

            // Kiểm tra PracticeExamPaperDTO
            result.PracticeExamPaperDTO.Should().NotBeNull();
            result.PracticeExamPaperDTO.Should().HaveCount(3);

            // Kiểm tra chi tiết từng PracticeExamPaper
            var examPapers = result.PracticeExamPaperDTO.ToList();
            
            examPapers[0].PracExamPaperId.Should().Be(1);
            examPapers[0].PracExamPaperName.Should().Be("Đề thi cuối kỳ Web - Bài 1");
            
            examPapers[1].PracExamPaperId.Should().Be(2);
            examPapers[1].PracExamPaperName.Should().Be("Đề thi cuối kỳ Web - Bài 2");
            
            examPapers[2].PracExamPaperId.Should().Be(3);
            examPapers[2].PracExamPaperName.Should().Be("Đề thi cuối kỳ Web - Bài 3");
        }

        [Test]
        public async Task ViewPracFinalExamDetail_TestCase2_InvalidExamId_ThrowsException()
        {
            // Arrange
            var invalidExamId = 999; // Không tồn tại

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.ViewPracFinalExamDetail(invalidExamId));
            exception.Message.Should().Be("Practice exam not found.");
        }

        [Test]
        public async Task ViewPracFinalExamDetail_TestCase3_ExamIdZero_ThrowsException()
        {
            // Arrange
            var invalidExamId = 0;

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.ViewPracFinalExamDetail(invalidExamId));
            exception.Message.Should().Be("Practice exam not found.");
        }

        [Test]
        public async Task ViewPracFinalExamDetail_TestCase4_NegativeExamId_ThrowsException()
        {
            // Arrange
            var invalidExamId = -1;

            // Act & Assert
            var exception = Assert.ThrowsAsync<Exception>(async () =>
                await _repository.ViewPracFinalExamDetail(invalidExamId));
            exception.Message.Should().Be("Practice exam not found.");
        }

        [Test]
        public async Task ViewPracFinalExamDetail_TestCase5_ExamWithNoPapers_ReturnsEmptyPracticeExamPaperDTO()
        {
            // Arrange: Tạo một exam mới không có đề thi
            var teacher = await _context.Teachers.FirstAsync();
            var practiceExamWithoutPapers = new PracticeExam
            {
                PracExamId = 2,
                PracExamName = "Kỳ thi không có đề thi",
                SubjectId = 1,
                Duration = 60,
                StartDay = DateTime.Now.AddDays(14),
                EndDay = DateTime.Now.AddDays(14).AddHours(1),
                CategoryExamId = 2,
                SemesterId = 1,
                TeacherId = teacher.TeacherId,
                CreateAt = DateTime.Now,
                ClassId = 1,
                IsGraded = 0
            };
            _context.PracticeExams.Add(practiceExamWithoutPapers);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.ViewPracFinalExamDetail(2);

            // Assert
            result.Should().NotBeNull();
            result.ExamId.Should().Be(2);
            result.PracExamName.Should().Be("Kỳ thi không có đề thi");
            result.PracticeExamPaperDTO.Should().NotBeNull();
            result.PracticeExamPaperDTO.Should().BeEmpty();
        }

        [Test]
        public async Task ViewPracFinalExamDetail_TestCase6_ExamWithSinglePaper_ReturnsCorrectData()
        {
            // Arrange: Tạo exam mới với chỉ 1 đề thi
            var teacher = await _context.Teachers.FirstAsync();
            var practiceExamSinglePaper = new PracticeExam
            {
                PracExamId = 3,
                PracExamName = "Kỳ thi với 1 đề thi",
                SubjectId = 1,
                Duration = 90,
                StartDay = DateTime.Now.AddDays(21),
                EndDay = DateTime.Now.AddDays(21).AddHours(1.5),
                CategoryExamId = 2,
                SemesterId = 1,
                TeacherId = teacher.TeacherId,
                CreateAt = DateTime.Now,
                ClassId = 1,
            };
            _context.PracticeExams.Add(practiceExamSinglePaper);

            // Tạo đề thi mới
            var newPracticeExamPaper = new PracticeExamPaper
            {
                PracExamPaperId = 4,
                PracExamPaperName = "Đề thi đơn lẻ",
                SubjectId = 1,
                SemesterId = 1,
                CategoryExamId = 2,
                CreateAt = DateTime.Now,
                Status = "Active"
            };
            _context.PracticeExamPapers.Add(newPracticeExamPaper);

            // Liên kết exam với đề thi
            var noPEPaperInPE = new NoPEPaperInPE
            {
                PracExamId = 3,
                PracExamPaperId = 4
            };
            _context.NoPEPaperInPEs.Add(noPEPaperInPE);

            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.ViewPracFinalExamDetail(3);

            // Assert
            result.Should().NotBeNull();
            result.ExamId.Should().Be(3);
            result.PracExamName.Should().Be("Kỳ thi với 1 đề thi");
            result.PracticeExamPaperDTO.Should().HaveCount(1);
            result.PracticeExamPaperDTO.First().PracExamPaperId.Should().Be(4);
            result.PracticeExamPaperDTO.First().PracExamPaperName.Should().Be("Đề thi đơn lẻ");
        }

        [Test]
        public async Task ViewPracFinalExamDetail_TestCase7_ExamWithMultiplePapers_ReturnsCorrectData()
        {
            // Arrange: Tạo exam mới với nhiều đề thi
            var teacher = await _context.Teachers.FirstAsync();
            var practiceExamMultiplePapers = new PracticeExam
            {
                PracExamId = 4,
                PracExamName = "Kỳ thi với nhiều đề thi",
                SubjectId = 1,
                Duration = 180,
                StartDay = DateTime.Now.AddDays(28),
                EndDay = DateTime.Now.AddDays(28).AddHours(3),
                CategoryExamId = 2,
                SemesterId = 1,
                TeacherId = teacher.TeacherId,
                CreateAt = DateTime.Now,
                ClassId = 1,
            };
            _context.PracticeExams.Add(practiceExamMultiplePapers);

            // Tạo nhiều đề thi mới
            for (int i = 5; i <= 8; i++)
            {
                var newPracticeExamPaper = new PracticeExamPaper
                {
                    PracExamPaperId = i,
                    PracExamPaperName = $"Đề thi số {i}",
                    SubjectId = 1,
                    SemesterId = 1,
                    CategoryExamId = 2,
                    CreateAt = DateTime.Now,
                    Status = "Active"
                };
                _context.PracticeExamPapers.Add(newPracticeExamPaper);

                // Liên kết exam với đề thi
                var noPEPaperInPE = new NoPEPaperInPE
                {
                    PracExamId = 4,
                    PracExamPaperId = i
                };
                _context.NoPEPaperInPEs.Add(noPEPaperInPE);
            }

            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.ViewPracFinalExamDetail(4);

            // Assert
            result.Should().NotBeNull();
            result.ExamId.Should().Be(4);
            result.PracExamName.Should().Be("Kỳ thi với nhiều đề thi");
            result.PracticeExamPaperDTO.Should().HaveCount(4);

            // Kiểm tra từng đề thi
            var examPapers = result.PracticeExamPaperDTO.ToList();
            for (int i = 0; i < 4; i++)
            {
                examPapers[i].PracExamPaperId.Should().Be(i + 5);
                examPapers[i].PracExamPaperName.Should().Be($"Đề thi số {i + 5}");
            }
        }
    }
} 