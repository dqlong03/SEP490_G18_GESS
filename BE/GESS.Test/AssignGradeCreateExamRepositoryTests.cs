using NUnit.Framework;
using Microsoft.EntityFrameworkCore;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Implement;
using GESS.Repository.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;

namespace GESS.Test
{
    [TestFixture]
    public class AssignGradeCreateExamRepositoryTests
    {
        private GessDbContext _context;
        private AssignGradeCreateExamRepository _repository;

        [SetUp]
        public void Setup()
        {
            // Khởi tạo In-Memory Database cho testing
            var options = new DbContextOptionsBuilder<GessDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new GessDbContext(options);

            // Khởi tạo repository
            _repository = new AssignGradeCreateExamRepository(_context);

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
            // Tạo Major
            var major = new Major
            {
                MajorId = 1,
                MajorName = "Công nghệ thông tin",
                StartDate = DateTime.Now.AddYears(-5),
                IsActive = true
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

            // Tạo User cho Teacher
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

            // Tạo Teacher
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

            // Tạo SubjectTeacher với IsGradeTeacher = false
            var subjectTeacher = new SubjectTeacher
            {
                SubjectId = 1,
                TeacherId = teacher.TeacherId,
                IsGradeTeacher = false,
                IsCreateExamTeacher = false,
                IsActiveSubjectTeacher = true
            };
            _context.SubjectTeachers.Add(subjectTeacher);

            _context.SaveChanges();
        }

        // ========== ASSIGN ROLE GRADE EXAM TEST CASES ==========
        // Dựa trên decision table và ngữ cảnh: Trưởng bộ môn xem danh sách môn học,
        // chọn 1 môn cụ thể, hiển thị danh sách giảng viên với 2 toggle: assign create và assign grading

        [Test]
        public void AssignRoleGradeExam_ValidAssignment_AssignsGradeRoleSuccessfully()
        {
            // Arrange: Giảng viên đã được assign vào môn học và chưa có role grading
            var teacherId = _context.Teachers.First().TeacherId;
            var subjectId = 1;

            // Act: Trưởng bộ môn toggle assign grading cho giảng viên
            var result = _repository.AssignRoleGradeExam(teacherId, subjectId);

            // Assert: Thành công và giảng viên được assign role grading
            result.Should().BeTrue();

            var updatedSubjectTeacher = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            updatedSubjectTeacher.Should().NotBeNull();
            updatedSubjectTeacher!.IsGradeTeacher.Should().BeTrue();
        }

        [Test]
        public void AssignRoleGradeExam_TeacherAlreadyHasGradeRole_RemovesGradeRole()
        {
            // Arrange: Giảng viên đã có role grading
            var teacherId = _context.Teachers.First().TeacherId;
            var subjectId = 1;

            var existingSubjectTeacher = _context.SubjectTeachers
                .First(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            existingSubjectTeacher.IsGradeTeacher = true;
            _context.SaveChanges();

            // Act: Trưởng bộ môn toggle lại assign grading
            var result = _repository.AssignRoleGradeExam(teacherId, subjectId);

            // Assert: Thành công và giảng viên bị remove role grading
            result.Should().BeTrue();

            var updatedSubjectTeacher = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            updatedSubjectTeacher.Should().NotBeNull();
            updatedSubjectTeacher!.IsGradeTeacher.Should().BeFalse();
        }

        [Test]
        public void AssignRoleGradeExam_AssignmentNotExists_ReturnsFalse()
        {
            // Arrange: Giảng viên chưa được assign vào môn học
            var nonExistentTeacherId = Guid.NewGuid();
            var subjectId = 1;

            // Act: Trưởng bộ môn cố gắng assign role grading
            var result = _repository.AssignRoleGradeExam(nonExistentTeacherId, subjectId);

            // Assert: Thất bại vì assignment không tồn tại
            result.Should().BeFalse();
        }

        [Test]
        public void AssignRoleGradeExam_EmptyTeacherId_ReturnsFalse()
        {
            // Arrange: TeacherId rỗng (Guid.Empty)
            var emptyTeacherId = Guid.Empty;
            var subjectId = 1;

            // Act: Trưởng bộ môn cố gắng assign role grading
            var result = _repository.AssignRoleGradeExam(emptyTeacherId, subjectId);

            // Assert: Thất bại vì TeacherId không hợp lệ
            result.Should().BeFalse();
        }

        [Test]
        public void AssignRoleGradeExam_NegativeSubjectId_ReturnsFalse()
        {
            // Arrange: SubjectId âm
            var teacherId = _context.Teachers.First().TeacherId;
            var negativeSubjectId = -1;

            // Act: Trưởng bộ môn cố gắng assign role grading
            var result = _repository.AssignRoleGradeExam(teacherId, negativeSubjectId);

            // Assert: Thất bại vì SubjectId không hợp lệ
            result.Should().BeFalse();
        }

        [Test]
        public void AssignRoleGradeExam_ZeroSubjectId_ReturnsFalse()
        {
            // Arrange: SubjectId = 0
            var teacherId = _context.Teachers.First().TeacherId;
            var zeroSubjectId = 0;

            // Act: Trưởng bộ môn cố gắng assign role grading
            var result = _repository.AssignRoleGradeExam(teacherId, zeroSubjectId);

            // Assert: Thất bại vì SubjectId không hợp lệ
            result.Should().BeFalse();
        }

        [Test]
        public void AssignRoleGradeExam_ToggleRoleMultipleTimes_WorksCorrectly()
        {
            // Arrange
            var teacherId = _context.Teachers.First().TeacherId;
            var subjectId = 1;

            // Act & Assert - Lần 1: Assign role grading
            var result1 = _repository.AssignRoleGradeExam(teacherId, subjectId);
            result1.Should().BeTrue();

            var subjectTeacher1 = _context.SubjectTeachers
                .First(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            subjectTeacher1.IsGradeTeacher.Should().BeTrue();

            // Act & Assert - Lần 2: Remove role grading
            var result2 = _repository.AssignRoleGradeExam(teacherId, subjectId);
            result2.Should().BeTrue();

            var subjectTeacher2 = _context.SubjectTeachers
                .First(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            subjectTeacher2.IsGradeTeacher.Should().BeFalse();

            // Act & Assert - Lần 3: Assign role grading lại
            var result3 = _repository.AssignRoleGradeExam(teacherId, subjectId);
            result3.Should().BeTrue();

            var subjectTeacher3 = _context.SubjectTeachers
                .First(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            subjectTeacher3.IsGradeTeacher.Should().BeTrue();
        }

        [Test]
        public void AssignRoleGradeExam_OnlyIsGradeTeacherChanged_OtherPropertiesUnchanged()
        {
            // Arrange: Giảng viên đã có role create exam
            var teacherId = _context.Teachers.First().TeacherId;
            var subjectId = 1;

            var existingSubjectTeacher = _context.SubjectTeachers
                .First(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            existingSubjectTeacher.IsCreateExamTeacher = true;
            existingSubjectTeacher.IsActiveSubjectTeacher = true;
            _context.SaveChanges();

            // Act: Trưởng bộ môn assign role grading
            var result = _repository.AssignRoleGradeExam(teacherId, subjectId);

            // Assert: Chỉ IsGradeTeacher thay đổi, các property khác giữ nguyên
            result.Should().BeTrue();

            var updatedSubjectTeacher = _context.SubjectTeachers
                .First(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            updatedSubjectTeacher.IsGradeTeacher.Should().BeTrue();
            updatedSubjectTeacher.IsCreateExamTeacher.Should().BeTrue(); // Không thay đổi
            updatedSubjectTeacher.IsActiveSubjectTeacher.Should().BeTrue(); // Không thay đổi
        }

        // ========== DELETE TEACHER FROM SUBJECT TEST CASES ==========
        // Ngữ cảnh: Trưởng bộ môn xóa giảng viên khỏi môn học (soft delete)

        [Test]
        public void DeleteTeacherFromSubject_ValidAssignment_DeletesSuccessfully()
        {
            // Arrange: Giảng viên đã được assign vào môn học và đang active
            var teacherId = _context.Teachers.First().TeacherId;
            var subjectId = 1;

            // Act: Trưởng bộ môn xóa giảng viên khỏi môn học
            var result = _repository.DeleteTeacherFromSubject(teacherId, subjectId);

            // Assert: Thành công và giảng viên bị xóa (soft delete)
            result.Should().BeTrue();

            var updatedSubjectTeacher = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            updatedSubjectTeacher.Should().NotBeNull();
            updatedSubjectTeacher!.IsActiveSubjectTeacher.Should().BeFalse();
        }

        [Test]
        public void DeleteTeacherFromSubject_AssignmentNotExists_ReturnsFalse()
        {
            // Arrange: Giảng viên chưa được assign vào môn học
            var nonExistentTeacherId = Guid.NewGuid();
            var subjectId = 1;

            // Act: Trưởng bộ môn cố gắng xóa giảng viên
            var result = _repository.DeleteTeacherFromSubject(nonExistentTeacherId, subjectId);

            // Assert: Thất bại vì assignment không tồn tại
            result.Should().BeFalse();
        }

        [Test]
        public void DeleteTeacherFromSubject_EmptyTeacherId_ReturnsFalse()
        {
            // Arrange: TeacherId rỗng (Guid.Empty)
            var emptyTeacherId = Guid.Empty;
            var subjectId = 1;

            // Act: Trưởng bộ môn cố gắng xóa giảng viên
            var result = _repository.DeleteTeacherFromSubject(emptyTeacherId, subjectId);

            // Assert: Thất bại vì TeacherId không hợp lệ
            result.Should().BeFalse();
        }

        [Test]
        public void DeleteTeacherFromSubject_NegativeSubjectId_ReturnsFalse()
        {
            // Arrange: SubjectId âm
            var teacherId = _context.Teachers.First().TeacherId;
            var negativeSubjectId = -1;

            // Act: Trưởng bộ môn cố gắng xóa giảng viên
            var result = _repository.DeleteTeacherFromSubject(teacherId, negativeSubjectId);

            // Assert: Thất bại vì SubjectId không hợp lệ
            result.Should().BeFalse();
        }

        [Test]
        public void DeleteTeacherFromSubject_ZeroSubjectId_ReturnsFalse()
        {
            // Arrange: SubjectId = 0
            var teacherId = _context.Teachers.First().TeacherId;
            var zeroSubjectId = 0;

            // Act: Trưởng bộ môn cố gắng xóa giảng viên
            var result = _repository.DeleteTeacherFromSubject(teacherId, zeroSubjectId);

            // Assert: Thất bại vì SubjectId không hợp lệ
            result.Should().BeFalse();
        }

        [Test]
        public void DeleteTeacherFromSubject_AlreadyInactiveAssignment_ReturnsTrue()
        {
            // Arrange: Assignment đã bị inactive trước đó
            var teacherId = _context.Teachers.First().TeacherId;
            var subjectId = 1;

            var existingSubjectTeacher = _context.SubjectTeachers
                .First(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            existingSubjectTeacher.IsActiveSubjectTeacher = false;
            _context.SaveChanges();

            // Act: Trưởng bộ môn xóa giảng viên (đã inactive)
            var result = _repository.DeleteTeacherFromSubject(teacherId, subjectId);

            // Assert: Vẫn thành công vì logic chỉ set IsActiveSubjectTeacher = false
            result.Should().BeTrue();

            var updatedSubjectTeacher = _context.SubjectTeachers
                .First(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            updatedSubjectTeacher.IsActiveSubjectTeacher.Should().BeFalse();
        }

        [Test]
        public void DeleteTeacherFromSubject_OnlyIsActiveSubjectTeacherChanged_OtherPropertiesUnchanged()
        {
            // Arrange: Giảng viên có các role khác
            var teacherId = _context.Teachers.First().TeacherId;
            var subjectId = 1;

            var existingSubjectTeacher = _context.SubjectTeachers
                .First(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            existingSubjectTeacher.IsGradeTeacher = true;
            existingSubjectTeacher.IsCreateExamTeacher = true;
            existingSubjectTeacher.IsActiveSubjectTeacher = true;
            _context.SaveChanges();

            // Act: Trưởng bộ môn xóa giảng viên
            var result = _repository.DeleteTeacherFromSubject(teacherId, subjectId);

            // Assert: Chỉ IsActiveSubjectTeacher thay đổi, các property khác giữ nguyên
            result.Should().BeTrue();

            var updatedSubjectTeacher = _context.SubjectTeachers
                .First(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            updatedSubjectTeacher.IsActiveSubjectTeacher.Should().BeFalse();
            updatedSubjectTeacher.IsGradeTeacher.Should().BeTrue(); // Không thay đổi
            updatedSubjectTeacher.IsCreateExamTeacher.Should().BeTrue(); // Không thay đổi
        }

        [Test]
        public void DeleteTeacherFromSubject_TeacherHasGradingAssignmentInLatestSemester_ReturnsFalse()
        {
            // Arrange: Giảng viên đang chấm thi trong kỳ mới nhất
            var teacherId = _context.Teachers.First().TeacherId;
            var subjectId = 1;

            // Tạo Semester
            var semester = new Semester
            {
                SemesterId = 2,
                SemesterName = "Học kỳ 2",
                IsActive = true
            };
            _context.Semesters.Add(semester);

            // Tạo Room
            var room = new Room
            {
                RoomId = 1,
                RoomName = "A101",
                Capacity = 50,
                Status = "true"
            };
            _context.Rooms.Add(room);

            // Tạo ExamSlot
            var examSlot = new ExamSlot
            {
                ExamSlotId = 1,
                SlotName = "Ca thi 1",
                StartTime = TimeSpan.FromHours(8),
                EndTime = TimeSpan.FromHours(10),
            };
            _context.ExamSlots.Add(examSlot);

            // Tạo ExamSlotRoom với giảng viên đang chấm thi trong kỳ mới nhất (2024, kỳ 2)
            var examSlotRoom = new ExamSlotRoom
            {
                ExamSlotRoomId = 1,
                ExamSlotId = 1,
                RoomId = 1,
                SemesterId = 2,
                ExamGradedId = teacherId, // Giảng viên đang chấm thi
                SubjectId = subjectId,
                ExamDate = new DateTime(2024, 12, 15), // Kỳ mới nhất
                Status = 0,
                MultiOrPractice = "Practice",
                IsGraded = 0
            };
            _context.ExamSlotRooms.Add(examSlotRoom);

            // Tạo thêm 1 ExamSlotRoom cũ hơn để test logic lấy kỳ mới nhất
            var oldExamSlotRoom = new ExamSlotRoom
            {
                ExamSlotRoomId = 2,
                ExamSlotId = 1,
                RoomId = 1,
                SemesterId = 1,
                ExamGradedId = teacherId, // Cùng giảng viên
                SubjectId = subjectId,
                ExamDate = new DateTime(2023, 6, 15), // Kỳ cũ hơn
                Status = 2,
                MultiOrPractice = "Practice",
                IsGraded = 1
            };
            _context.ExamSlotRooms.Add(oldExamSlotRoom);

            _context.SaveChanges();

            // Act: Trưởng bộ môn cố gắng xóa giảng viên
            var result = _repository.DeleteTeacherFromSubject(teacherId, subjectId);

            // Assert: Thất bại vì giảng viên đang chấm thi trong kỳ mới nhất
            result.Should().BeFalse();

            // Kiểm tra SubjectTeacher vẫn active
            var subjectTeacher = _context.SubjectTeachers
                .First(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            subjectTeacher.IsActiveSubjectTeacher.Should().BeTrue();
        }

        // ========== GET ALL TEACHER HAVE SUBJECT TEST CASES ==========
        // Ngữ cảnh: Trưởng bộ môn xem danh sách giảng viên của 1 môn học với filter và phân trang

        [Test]
        public async Task GetAllTeacherHaveSubject_ValidSubjectId_ReturnsTeachersList()
        {
            // Arrange: Môn học có giảng viên
            var subjectId = 1;

            // Act: Lấy danh sách giảng viên của môn học
            var result = await _repository.GetAllTeacherHaveSubject(subjectId);

            // Assert: Trả về danh sách giảng viên
            result.Should().NotBeNull();
            result.Should().HaveCount(1);

            var teacher = result.First();
            teacher.TeacherId.Should().Be(_context.Teachers.First().TeacherId);
            teacher.Fullname.Should().Be("Giáo viên 1");
            teacher.UserName.Should().Be("teacher1@fpt.edu.vn");
            teacher.Code.Should().Be("GV001");
            teacher.IsGraded.Should().BeFalse();
            teacher.IsCreateExam.Should().BeFalse();
        }

        [Test]
        public async Task GetAllTeacherHaveSubject_SubjectIdNotExists_ReturnsEmptyList()
        {
            // Arrange: Môn học không tồn tại
            var nonExistentSubjectId = 999;

            // Act: Lấy danh sách giảng viên của môn học không tồn tại
            var result = await _repository.GetAllTeacherHaveSubject(nonExistentSubjectId);

            // Assert: Trả về danh sách rỗng
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Test]
        public async Task GetAllTeacherHaveSubject_WithTextSearchMatch_ReturnsFilteredTeachers()
        {
            // Arrange: Thêm giảng viên thứ 2 để test search
            var teacherUser2 = new User
            {
                Id = Guid.NewGuid(),
                UserName = "teacher2@fpt.edu.vn",
                Email = "teacher2@fpt.edu.vn",
                Fullname = "Nguyễn Văn B",
                Code = "GV002",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                TwoFactorEnabled = false,
                LockoutEnabled = false,
                AccessFailedCount = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };
            _context.Users.Add(teacherUser2);

            var teacher2 = new Teacher
            {
                TeacherId = Guid.NewGuid(),
                UserId = teacherUser2.Id,
                User = teacherUser2,
                HireDate = DateTime.Now.AddYears(-1),
                IsHeadOfDepartment = false,
                IsExamManager = false,
                MajorId = 1
            };
            _context.Teachers.Add(teacher2);

            var subjectTeacher2 = new SubjectTeacher
            {
                SubjectId = 1,
                TeacherId = teacher2.TeacherId,
                IsGradeTeacher = true,
                IsCreateExamTeacher = false,
                IsActiveSubjectTeacher = true
            };
            _context.SubjectTeachers.Add(subjectTeacher2);

            _context.SaveChanges();

            // Act: Tìm kiếm theo tên
            var result = await _repository.GetAllTeacherHaveSubject(1, "Nguyễn");

            // Assert: Trả về giảng viên có tên chứa "Nguyễn"
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            result.First().Fullname.Should().Be("Nguyễn Văn B");
        }

        [Test]
        public async Task GetAllTeacherHaveSubject_WithTextSearchNoMatch_ReturnsEmptyList()
        {
            // Act: Tìm kiếm không có kết quả
            var result = await _repository.GetAllTeacherHaveSubject(1, "KhôngTồnTại");

            // Assert: Trả về danh sách rỗng
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Test]
        public async Task GetAllTeacherHaveSubject_WithPagination_ReturnsCorrectPage()
        {
            // Arrange: Thêm nhiều giảng viên để test pagination
            for (int i = 2; i <= 15; i++)
            {
                var teacherUser = new User
                {
                    Id = Guid.NewGuid(),
                    UserName = $"teacher{i}@fpt.edu.vn",
                    Email = $"teacher{i}@fpt.edu.vn",
                    Fullname = $"Giảng viên {i}",
                    Code = $"GV{i:D3}",
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
                    HireDate = DateTime.Now.AddYears(-1),
                    IsHeadOfDepartment = false,
                    IsExamManager = false,
                    MajorId = 1
                };
                _context.Teachers.Add(teacher);

                var subjectTeacher = new SubjectTeacher
                {
                    SubjectId = 1,
                    TeacherId = teacher.TeacherId,
                    IsGradeTeacher = false,
                    IsCreateExamTeacher = false,
                    IsActiveSubjectTeacher = true
                };
                _context.SubjectTeachers.Add(subjectTeacher);
            }
            _context.SaveChanges();

            // Act: Lấy trang 2 với 5 items per page
            var result = await _repository.GetAllTeacherHaveSubject(1, null, 2, 5);

            // Assert: Trả về 5 items của trang 2
            result.Should().NotBeNull();
            result.Should().HaveCount(5);

            // Kiểm tra thứ tự sắp xếp theo Fullname
            var teacherNames = result.Select(t => t.Fullname).ToList();
            teacherNames.Should().BeInAscendingOrder();
        }

        [Test]
        public async Task GetAllTeacherHaveSubject_WithInvalidPagination_ReturnsEmptyList()
        {
            // Act: Trang không tồn tại hoặc page size = 0
            var result1 = await _repository.GetAllTeacherHaveSubject(1, null, 999, 10);
            var result2 = await _repository.GetAllTeacherHaveSubject(1, null, 1, 0);

            // Assert: Trả về danh sách rỗng
            result1.Should().NotBeNull();
            result1.Should().BeEmpty();
            result2.Should().NotBeNull();
            result2.Should().BeEmpty();
        }

        [Test]
        public async Task GetAllTeacherHaveSubject_WithPaginationAndSearch_ReturnsCorrectPage()
        {
            // Act: Tìm kiếm và phân trang
            var result = await _repository.GetAllTeacherHaveSubject(1, "Giáo viên", 1, 3);

            // Assert: Trả về kết quả đã filter và phân trang
            result.Should().NotBeNull();
            result.Should().HaveCount(1); // Chỉ có 1 giảng viên có tên "Giáo viên"
        }

        [Test]
        public async Task GetAllTeacherHaveSubject_WithPaginationOnly_ReturnsCorrectPage()
        {
            // Arrange: Thêm nhiều giảng viên để test pagination
            for (int i = 2; i <= 10; i++)
            {
                var teacherUser = new User
                {
                    Id = Guid.NewGuid(),
                    UserName = $"teacher{i}@fpt.edu.vn",
                    Email = $"teacher{i}@fpt.edu.vn",
                    Fullname = $"Giảng viên {i}",
                    Code = $"GV{i:D3}",
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
                    HireDate = DateTime.Now.AddYears(-1),
                    IsHeadOfDepartment = false,
                    IsExamManager = false,
                    MajorId = 1
                };
                _context.Teachers.Add(teacher);

                var subjectTeacher = new SubjectTeacher
                {
                    SubjectId = 1,
                    TeacherId = teacher.TeacherId,
                    IsGradeTeacher = false,
                    IsCreateExamTeacher = false,
                    IsActiveSubjectTeacher = true
                };
                _context.SubjectTeachers.Add(subjectTeacher);
            }
            _context.SaveChanges();

            // Act: Chỉ dùng phân trang, không search
            var result = await _repository.GetAllTeacherHaveSubject(1, null, 1, 5);

            // Assert: Trả về 5 items của trang 1
            result.Should().NotBeNull();
            result.Should().HaveCount(5);
            
            // Kiểm tra thứ tự sắp xếp theo Fullname
            var teacherNames = result.Select(t => t.Fullname).ToList();
            teacherNames.Should().BeInAscendingOrder();
        }


    }
}