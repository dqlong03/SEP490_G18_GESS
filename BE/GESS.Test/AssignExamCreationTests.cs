using NUnit.Framework;
using Moq;
using Gess.Repository.Infrastructures;
using GESS.Repository.Implement;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace GESS.Test
{
    [TestFixture]
    public class AssignExamCreationTests
    {
        private GessDbContext _context;
        private AssignGradeCreateExamRepository _repository;

        [SetUp]
        public void Setup()
        {
            // Tạo in-memory database cho test
            var options = new DbContextOptionsBuilder<GessDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new GessDbContext(options);
            _repository = new AssignGradeCreateExamRepository(_context);
        }

        [TearDown]
        public void Cleanup()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        // ========== SUCCESS TEST CASES ==========
        [Test]
        public void AssignRoleCreateExam_ValidAssignment_AssignsRoleSuccessfully()
        {
            // Arrange
            var teacherId = Guid.NewGuid();
            var subjectId = 1;

            // Tạo assignment trước
            var subjectTeacher = new SubjectTeacher
            {
                TeacherId = teacherId,
                SubjectId = subjectId,
                IsGradeTeacher = false,
                IsCreateExamTeacher = false,
                IsActiveSubjectTeacher = true
            };
            _context.SubjectTeachers.Add(subjectTeacher);
            _context.SaveChanges();

            // Act
            var result = _repository.AssignRoleCreateExam(teacherId, subjectId);

            // Assert
            Assert.IsTrue(result);
            
            // Verify role was assigned
            var updatedAssignment = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            Assert.IsNotNull(updatedAssignment);
            Assert.IsTrue(updatedAssignment.IsCreateExamTeacher);
        }

        [Test]
        public void AssignRoleCreateExam_AlreadyAssigned_RemovesRoleSuccessfully()
        {
            // Arrange
            var teacherId = Guid.NewGuid();
            var subjectId = 1;

            // Tạo assignment với role đã được assign
            var subjectTeacher = new SubjectTeacher
            {
                TeacherId = teacherId,
                SubjectId = subjectId,
                IsGradeTeacher = false,
                IsCreateExamTeacher = true, // Đã được assign
                IsActiveSubjectTeacher = true
            };
            _context.SubjectTeachers.Add(subjectTeacher);
            _context.SaveChanges();

            // Act
            var result = _repository.AssignRoleCreateExam(teacherId, subjectId);

            // Assert
            Assert.IsTrue(result);
            
            // Verify role was removed
            var updatedAssignment = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            Assert.IsNotNull(updatedAssignment);
            Assert.IsFalse(updatedAssignment.IsCreateExamTeacher);
        }

        [Test]
        public void AssignRoleCreateExam_ToggleRoleMultipleTimes_WorksCorrectly()
        {
            // Arrange
            var teacherId = Guid.NewGuid();
            var subjectId = 1;

            // Tạo assignment ban đầu
            var subjectTeacher = new SubjectTeacher
            {
                TeacherId = teacherId,
                SubjectId = subjectId,
                IsGradeTeacher = false,
                IsCreateExamTeacher = false,
                IsActiveSubjectTeacher = true
            };
            _context.SubjectTeachers.Add(subjectTeacher);
            _context.SaveChanges();

            // Act & Assert - Lần 1: Assign role
            var result1 = _repository.AssignRoleCreateExam(teacherId, subjectId);
            Assert.IsTrue(result1);
            
            var assignment1 = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            Assert.IsTrue(assignment1.IsCreateExamTeacher);

            // Act & Assert - Lần 2: Remove role
            var result2 = _repository.AssignRoleCreateExam(teacherId, subjectId);
            Assert.IsTrue(result2);
            
            var assignment2 = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            Assert.IsFalse(assignment2.IsCreateExamTeacher);

            // Act & Assert - Lần 3: Assign role lại
            var result3 = _repository.AssignRoleCreateExam(teacherId, subjectId);
            Assert.IsTrue(result3);
            
            var assignment3 = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            Assert.IsTrue(assignment3.IsCreateExamTeacher);
        }

        // ========== FAILURE TEST CASES ==========
        [Test]
        public void AssignRoleCreateExam_AssignmentNotExists_ReturnsFalse()
        {
            // Arrange
            var teacherId = Guid.NewGuid();
            var subjectId = 1;

            // Act - Không tạo assignment trước
            var result = _repository.AssignRoleCreateExam(teacherId, subjectId);

            // Assert
            Assert.IsFalse(result);
        }

        [Test]
        public void AssignRoleCreateExam_EmptyTeacherId_ReturnsFalse()
        {
            // Arrange
            var teacherId = Guid.Empty;
            var subjectId = 1;

            // Act
            var result = _repository.AssignRoleCreateExam(teacherId, subjectId);

            // Assert
            Assert.IsFalse(result);
        }

        [Test]
        public void AssignRoleCreateExam_NegativeSubjectId_ReturnsFalse()
        {
            // Arrange
            var teacherId = Guid.NewGuid();
            var subjectId = -1;

            // Act
            var result = _repository.AssignRoleCreateExam(teacherId, subjectId);

            // Assert
            Assert.IsFalse(result);
        }

        [Test]
        public void AssignRoleCreateExam_ZeroSubjectId_ReturnsFalse()
        {
            // Arrange
            var teacherId = Guid.NewGuid();
            var subjectId = 0;

            // Act
            var result = _repository.AssignRoleCreateExam(teacherId, subjectId);

            // Assert
            Assert.IsFalse(result);
        }

        [Test]
        public void AssignRoleCreateExam_InactiveAssignment_ReturnsFalse()
        {
            // Arrange
            var teacherId = Guid.NewGuid();
            var subjectId = 1;

            // Tạo assignment nhưng inactive
            var subjectTeacher = new SubjectTeacher
            {
                TeacherId = teacherId,
                SubjectId = subjectId,
                IsGradeTeacher = false,
                IsCreateExamTeacher = false,
                IsActiveSubjectTeacher = false // Inactive
            };
            _context.SubjectTeachers.Add(subjectTeacher);
            _context.SaveChanges();

            // Act
            var result = _repository.AssignRoleCreateExam(teacherId, subjectId);

            // Assert
            Assert.IsFalse(result);
        }

        // ========== EDGE CASES ==========
        [Test]
        public void AssignRoleCreateExam_DifferentTeacherSameSubject_WorksIndependently()
        {
            // Arrange
            var teacherId1 = Guid.NewGuid();
            var teacherId2 = Guid.NewGuid();
            var subjectId = 1;

            // Tạo 2 assignments cho cùng 1 subject
            var subjectTeacher1 = new SubjectTeacher
            {
                TeacherId = teacherId1,
                SubjectId = subjectId,
                IsGradeTeacher = false,
                IsCreateExamTeacher = false,
                IsActiveSubjectTeacher = true
            };
            var subjectTeacher2 = new SubjectTeacher
            {
                TeacherId = teacherId2,
                SubjectId = subjectId,
                IsGradeTeacher = false,
                IsCreateExamTeacher = false,
                IsActiveSubjectTeacher = true
            };
            _context.SubjectTeachers.AddRange(subjectTeacher1, subjectTeacher2);
            _context.SaveChanges();

            // Act
            var result1 = _repository.AssignRoleCreateExam(teacherId1, subjectId);
            var result2 = _repository.AssignRoleCreateExam(teacherId2, subjectId);

            // Assert
            Assert.IsTrue(result1);
            Assert.IsTrue(result2);
            
            // Verify both teachers have role assigned
            var assignment1 = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId1 && st.SubjectId == subjectId);
            var assignment2 = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId2 && st.SubjectId == subjectId);
            
            Assert.IsTrue(assignment1.IsCreateExamTeacher);
            Assert.IsTrue(assignment2.IsCreateExamTeacher);
        }

        [Test]
        public void AssignRoleCreateExam_SameTeacherDifferentSubjects_WorksIndependently()
        {
            // Arrange
            var teacherId = Guid.NewGuid();
            var subjectId1 = 1;
            var subjectId2 = 2;

            // Tạo 2 assignments cho cùng 1 teacher
            var subjectTeacher1 = new SubjectTeacher
            {
                TeacherId = teacherId,
                SubjectId = subjectId1,
                IsGradeTeacher = false,
                IsCreateExamTeacher = false,
                IsActiveSubjectTeacher = true
            };
            var subjectTeacher2 = new SubjectTeacher
            {
                TeacherId = teacherId,
                SubjectId = subjectId2,
                IsGradeTeacher = false,
                IsCreateExamTeacher = false,
                IsActiveSubjectTeacher = true
            };
            _context.SubjectTeachers.AddRange(subjectTeacher1, subjectTeacher2);
            _context.SaveChanges();

            // Act
            var result1 = _repository.AssignRoleCreateExam(teacherId, subjectId1);
            var result2 = _repository.AssignRoleCreateExam(teacherId, subjectId2);

            // Assert
            Assert.IsTrue(result1);
            Assert.IsTrue(result2);
            
            // Verify both subjects have role assigned
            var assignment1 = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId && st.SubjectId == subjectId1);
            var assignment2 = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId && st.SubjectId == subjectId2);
            
            Assert.IsTrue(assignment1.IsCreateExamTeacher);
            Assert.IsTrue(assignment2.IsCreateExamTeacher);
        }
    }
} 