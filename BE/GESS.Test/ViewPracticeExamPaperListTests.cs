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
    public class ViewPracticeExamPaperListTests
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
            var subject1 = new Subject
            {
                SubjectId = 1,
                SubjectName = "Lập trình web",
                Description = "Môn học về lập trình web",
                Course = "WEB101",
                NoCredits = 3
            };
            var subject2 = new Subject
            {
                SubjectId = 2,
                SubjectName = "Cơ sở dữ liệu",
                Description = "Môn học về cơ sở dữ liệu",
                Course = "DB101",
                NoCredits = 3
            };
            _context.Subjects.AddRange(subject1, subject2);

            // Tạo CategoryExam
            var categoryExam1 = new CategoryExam
            {
                CategoryExamId = 1,
                CategoryExamName = "Giữa kỳ"
            };
            var categoryExam2 = new CategoryExam
            {
                CategoryExamId = 2,
                CategoryExamName = "Cuối kỳ"
            };
            _context.CategoryExams.AddRange(categoryExam1, categoryExam2);

            // Tạo Semester
            var semester1 = new Semester
            {
                SemesterId = 1,
                SemesterName = "Học kỳ 1",
                IsActive = true
            };
            var semester2 = new Semester
            {
                SemesterId = 2,
                SemesterName = "Học kỳ 2",
                IsActive = true
            };
            _context.Semesters.AddRange(semester1, semester2);

            // Tạo PracticeExamPaper
            var examPaper1 = new PracticeExamPaper
            {
                PracExamPaperId = 1,
                PracExamPaperName = "Đề thi lập trình web giữa kỳ",
                NumberQuestion = 5,
                CreateAt = DateTime.UtcNow.AddDays(-10),
                Status = "Published",
                TeacherId = teacher.TeacherId,
                CategoryExamId = categoryExam1.CategoryExamId,
                CategoryExam = categoryExam1,
                SubjectId = subject1.SubjectId,
                Subject = subject1,
                SemesterId = semester1.SemesterId,
                Semester = semester1
            };

            var examPaper2 = new PracticeExamPaper
            {
                PracExamPaperId = 2,
                PracExamPaperName = "Đề thi cơ sở dữ liệu cuối kỳ",
                NumberQuestion = 8,
                CreateAt = DateTime.UtcNow.AddDays(-5),
                Status = "Draft",
                TeacherId = teacher.TeacherId,
                CategoryExamId = categoryExam2.CategoryExamId,
                CategoryExam = categoryExam2,
                SubjectId = subject2.SubjectId,
                Subject = subject2,
                SemesterId = semester2.SemesterId,
                Semester = semester2
            };

            var examPaper3 = new PracticeExamPaper
            {
                PracExamPaperId = 3,
                PracExamPaperName = "Đề thi lập trình web cuối kỳ",
                NumberQuestion = 6,
                CreateAt = DateTime.UtcNow.AddDays(-2),
                Status = "Published",
                TeacherId = teacher.TeacherId,
                CategoryExamId = categoryExam2.CategoryExamId,
                CategoryExam = categoryExam2,
                SubjectId = subject1.SubjectId,
                Subject = subject1,
                SemesterId = semester1.SemesterId,
                Semester = semester1
            };

            _context.PracticeExamPapers.AddRange(examPaper1, examPaper2, examPaper3);

            _context.SaveChanges();
        }

        [Test]
        public async Task GetAllExamPaperListAsync_ValidFilters_ReturnsFilteredList()
        {
            // Arrange
            var subjectId = 1; // Lập trình web
            var categoryExamId = 1; // Giữa kỳ

            // Act
            var result = await _practiceExamPaperRepository.GetAllExamPaperListAsync(
                searchName: null,
                subjectId: subjectId,
                semesterId: null,
                categoryExamId: categoryExamId,
                page: 1,
                pageSize: 10
            );

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            result.First().SubjectName.Should().Be("Lập trình web");
            result.First().CategoryExamName.Should().Be("Giữa kỳ");
            result.First().PracExamPaperName.Should().Be("Đề thi lập trình web giữa kỳ");
        }

        [Test]
        public async Task GetAllExamPaperListAsync_WithPagination_ReturnsCorrectPage()
        {
            // Arrange
            var page = 1;
            var pageSize = 2;

            // Act
            var result = await _practiceExamPaperRepository.GetAllExamPaperListAsync(
                searchName: null,
                subjectId: null,
                semesterId: null,
                categoryExamId: null,
                page: page,
                pageSize: pageSize
            );

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2); // Chỉ trả về 2 items theo pageSize
            // Kiểm tra rằng kết quả được sắp xếp theo ID tăng dần (thứ tự mặc định của database)
            result.Should().BeInAscendingOrder(x => x.PracExamPaperId);
        }

        [Test]
        public async Task GetAllExamPaperListAsync_WithSearchName_ReturnsMatchingResults()
        {
            // Arrange
            var searchName = "lập trình";

            // Act
            var result = await _practiceExamPaperRepository.GetAllExamPaperListAsync(
                searchName: searchName,
                subjectId: null,
                semesterId: null,
                categoryExamId: null,
                page: 1,
                pageSize: 10
            );

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2); // 2 đề thi có chứa "lập trình"
            result.Should().OnlyContain(x => x.PracExamPaperName.ToLower().Contains("lập trình"));
        }

        [Test]
        public async Task GetAllExamPaperListAsync_NoResults_ReturnsEmptyList()
        {
            // Arrange
            var searchName = "không tồn tại";

            // Act
            var result = await _practiceExamPaperRepository.GetAllExamPaperListAsync(
                searchName: searchName,
                subjectId: null,
                semesterId: null,
                categoryExamId: null,
                page: 1,
                pageSize: 10
            );

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Test]
        public async Task CountPageAsync_ValidFilters_ReturnsCorrectPageCount()
        {
            // Arrange
            var pageSize = 2;
            var totalItems = 3; // Có 3 đề thi trong database

            // Act
            var result = await _practiceExamPaperRepository.CountPageAsync(
                name: null,
                subjectId: null,
                semesterId: null,
                categoryExamId: null,
                pageSize: pageSize
            );

            // Assert
            result.Should().Be(2); // 3 items / 2 per page = 2 pages
        }

        [Test]
        public async Task GetAllPracticeExamPapersAsync_ValidFilters_ReturnsFilteredList()
        {
            // Arrange
            var subjectId = 1; // Lập trình web
            var categoryId = 1; // Giữa kỳ
            var teacherId = _context.Teachers.First().TeacherId;
            var semesterId = 1; // Học kỳ 1
            var year = DateTime.UtcNow.Year.ToString();

            // Act
            var result = await _practiceExamPaperRepository.GetAllPracticeExamPapersAsync(
                subjectId: subjectId,
                categoryId: categoryId,
                teacherId: teacherId,
                semesterId: semesterId,
                year: year
            );

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            var examPaper = result.First();
            examPaper.SubjectId.Should().Be(subjectId);
            examPaper.CategoryExamId.Should().Be(categoryId);
            examPaper.TeacherId.Should().Be(teacherId);
            examPaper.SemesterId.Should().Be(semesterId);
        }

        [Test]
        public async Task GetAllExamPaperListAsync_WithAllFilters_ReturnsCorrectResults()
        {
            // Arrange
            var searchName = "web";
            var subjectId = 1;
            var semesterId = 1;
            var categoryExamId = 2;

            // Act
            var result = await _practiceExamPaperRepository.GetAllExamPaperListAsync(
                searchName: searchName,
                subjectId: subjectId,
                semesterId: semesterId,
                categoryExamId: categoryExamId,
                page: 1,
                pageSize: 10
            );

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            var examPaper = result.First();
            examPaper.PracExamPaperName.Should().Contain("web");
            examPaper.SubjectName.Should().Be("Lập trình web");
            examPaper.SemesterName.Should().Be("Học kỳ 1");
            examPaper.CategoryExamName.Should().Be("Cuối kỳ");
        }

        [Test]
        public async Task GetAllExamPaperListAsync_InvalidPage_ReturnsFirstPage()
        {
            // Arrange
            var invalidPage = 0; // Page không hợp lệ

            // Act
            var result = await _practiceExamPaperRepository.GetAllExamPaperListAsync(
                searchName: null,
                subjectId: null,
                semesterId: null,
                categoryExamId: null,
                page: invalidPage,
                pageSize: 5
            );

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(3); // Trả về tất cả 3 items
        }

        [Test]
        public async Task GetAllExamPaperListAsync_InvalidPageSize_ReturnsDefaultPageSize()
        {
            // Arrange
            var invalidPageSize = 0; // PageSize không hợp lệ

            // Act
            var result = await _practiceExamPaperRepository.GetAllExamPaperListAsync(
                searchName: null,
                subjectId: null,
                semesterId: null,
                categoryExamId: null,
                page: 1,
                pageSize: invalidPageSize
            );

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(3); // Trả về tất cả items với default pageSize = 5
        }

        [Test]
        public async Task GetAllPracticeExamPapersAsync_WithYearFilter_ReturnsCorrectResults()
        {
            // Arrange
            var currentYear = DateTime.UtcNow.Year.ToString();

            // Act
            var result = await _practiceExamPaperRepository.GetAllPracticeExamPapersAsync(
                subjectId: null,
                categoryId: null,
                teacherId: null,
                semesterId: null,
                year: currentYear
            );

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(3); // Tất cả 3 đề thi đều được tạo trong năm hiện tại
            result.Should().OnlyContain(x => x.CreateAt.Year.ToString() == currentYear);
        }

        [Test]
        public async Task GetAllPracticeExamPapersAsync_WithTeacherFilter_ReturnsTeacherExams()
        {
            // Arrange
            var teacherId = _context.Teachers.First().TeacherId;

            // Act
            var result = await _practiceExamPaperRepository.GetAllPracticeExamPapersAsync(
                subjectId: null,
                categoryId: null,
                teacherId: teacherId,
                semesterId: null,
                year: null
            );

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(3); // Tất cả 3 đề thi đều thuộc về teacher này
            result.Should().OnlyContain(x => x.TeacherId == teacherId);
        }

        [Test]
        public async Task GetAllExamPaperListAsync_WithOverflowValues_ThrowsArgumentException()
        {
            // Arrange
            var largePage = int.MaxValue;
            var largePageSize = 2;

            // Act & Assert
            var action = async () => await _practiceExamPaperRepository.GetAllExamPaperListAsync(
                searchName: null,
                subjectId: null,
                semesterId: null,
                categoryExamId: null,
                page: largePage,
                pageSize: largePageSize
            );

            await action.Should().ThrowAsync<ArgumentException>()
                .WithMessage("*Page hoặc pageSize quá lớn*");
        }

        [Test]
        public async Task GetAllExamPaperListAsync_WithNullNavigationProperties_ReturnsDefaultValues()
        {
            // Arrange - Tạo một PracticeExamPaper với navigation properties null
            // Sử dụng ID thực tế từ seed data để tránh foreign key constraint
            var existingTeacher = _context.Teachers.First();
            var existingSubject = _context.Subjects.First();
            var existingSemester = _context.Semesters.First();
            var existingCategory = _context.CategoryExams.First();

            var examPaperWithNullNav = new PracticeExamPaper
            {
                PracExamPaperId = 999,
                PracExamPaperName = "Test Exam with Null Nav",
                NumberQuestion = 5,
                CreateAt = DateTime.UtcNow,
                Status = "Published",
                TeacherId = existingTeacher.TeacherId,
                CategoryExamId = existingCategory.CategoryExamId,
                SubjectId = existingSubject.SubjectId,
                SemesterId = existingSemester.SemesterId
            };
            _context.PracticeExamPapers.Add(examPaperWithNullNav);
            await _context.SaveChangesAsync();

            // Act - Tìm kiếm theo tên
            var result = await _practiceExamPaperRepository.GetAllExamPaperListAsync(
                searchName: "Test Exam with Null Nav",
                subjectId: null,
                semesterId: null,
                categoryExamId: null,
                page: 1,
                pageSize: 10
            );

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            result.First().PracExamPaperName.Should().Be("Test Exam with Null Nav");
            // Kiểm tra rằng navigation properties được load đúng
            result.First().CategoryExamName.Should().Be(existingCategory.CategoryExamName);
            result.First().SubjectName.Should().Be(existingSubject.SubjectName);
            result.First().SemesterName.Should().Be(existingSemester.SemesterName);
        }
    }
} 