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
    public class AddTeacherToSubjectRepositoryTests
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
        public void AddTeacherToSubject_NewAssignment_ReturnsTrue()
        {
            // Arrange
            var teacherId = Guid.NewGuid();
            var subjectId = 1;

            // Act
            var result = _repository.AddTeacherToSubject(teacherId, subjectId);

            // Assert
            Assert.IsTrue(result);
            
            // Verify data was saved to database
            var savedAssignment = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            Assert.IsNotNull(savedAssignment);
        }

        [Test]
        public void AddTeacherToSubject_DifferentTeacherAndSubject_ReturnsTrue()
        {
            // Arrange
            var teacherId1 = Guid.NewGuid();
            var teacherId2 = Guid.NewGuid();
            var subjectId1 = 1;
            var subjectId2 = 2;

            // Act
            var result1 = _repository.AddTeacherToSubject(teacherId1, subjectId1);
            var result2 = _repository.AddTeacherToSubject(teacherId2, subjectId2);

            // Assert
            Assert.IsTrue(result1);
            Assert.IsTrue(result2);
            
            // Verify both assignments exist
            var assignment1 = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId1 && st.SubjectId == subjectId1);
            var assignment2 = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId2 && st.SubjectId == subjectId2);
            
            Assert.IsNotNull(assignment1);
            Assert.IsNotNull(assignment2);
        }

        [Test]
        public void AddTeacherToSubject_SameTeacherDifferentSubjects_ReturnsTrue()
        {
            // Arrange
            var teacherId = Guid.NewGuid();
            var subjectId1 = 1;
            var subjectId2 = 2;

            // Act
            var result1 = _repository.AddTeacherToSubject(teacherId, subjectId1);
            var result2 = _repository.AddTeacherToSubject(teacherId, subjectId2);

            // Assert
            Assert.IsTrue(result1);
            Assert.IsTrue(result2);
            
            // Verify both assignments exist for same teacher
            var assignments = _context.SubjectTeachers
                .Where(st => st.TeacherId == teacherId)
                .ToList();
            
            Assert.That(assignments.Count, Is.EqualTo(2));
        }

        // ========== FAILURE TEST CASES ==========
        [Test]
        public void AddTeacherToSubject_DuplicateAssignment_ReturnsFalse()
        {
            // Arrange
            var teacherId = Guid.NewGuid();
            var subjectId = 1;

            // Act - Add same assignment twice
            var result1 = _repository.AddTeacherToSubject(teacherId, subjectId);
            var result2 = _repository.AddTeacherToSubject(teacherId, subjectId);

            // Assert
            Assert.IsTrue(result1);  // First time should succeed
            Assert.IsFalse(result2); // Second time should fail
            
            // Verify only one assignment exists
            var assignments = _context.SubjectTeachers
                .Where(st => st.TeacherId == teacherId && st.SubjectId == subjectId)
                .ToList();
            
            Assert.That(assignments.Count, Is.EqualTo(1));
        }

        // ========== VALIDATION TEST CASES ==========
        [Test]
        public void AddTeacherToSubject_EmptyTeacherId_ReturnsFalse()
        {
            // Arrange
            var teacherId = Guid.Empty;
            var subjectId = 1;

            // Act
            var result = _repository.AddTeacherToSubject(teacherId, subjectId);

            // Assert
            Assert.IsFalse(result); // Should fail validation
            
            // Verify no assignment was saved
            var assignment = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            
            Assert.IsNull(assignment);
        }

        [Test]
        public void AddTeacherToSubject_NegativeSubjectId_ReturnsFalse()
        {
            // Arrange
            var teacherId = Guid.NewGuid();
            var subjectId = -1;

            // Act
            var result = _repository.AddTeacherToSubject(teacherId, subjectId);

            // Assert
            Assert.IsFalse(result); // Should fail validation
            
            // Verify no assignment was saved
            var assignment = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            
            Assert.IsNull(assignment);
        }

        [Test]
        public void AddTeacherToSubject_ZeroSubjectId_ReturnsFalse()
        {
            // Arrange
            var teacherId = Guid.NewGuid();
            var subjectId = 0;

            // Act
            var result = _repository.AddTeacherToSubject(teacherId, subjectId);

            // Assert
            Assert.IsFalse(result); // Should fail validation
            
            // Verify no assignment was saved
            var assignment = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            
            Assert.IsNull(assignment);
        }
    }
} 