using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Class;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class ClassRepository : BaseRepository<Class>, IClassRepository
    {
        private readonly GessDbContext _context;
        public ClassRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }

        public Task<bool> ClassExistsAsync(string className)
        {
            var exists = _context.Classes.AnyAsync(c => c.ClassName == className);
            return exists;
        }

        public async Task<int> CountStudentsInClassAsync(int classId)
        {
            return await _context.ClassStudents
                .Where(cs => cs.ClassId == classId)
                .Select(cs => cs.StudentId) // lọc ra student
                .Distinct()                 // nếu có thể trùng lặp
                .CountAsync();
        }


        public async Task<IEnumerable<ClassListDTO>> GetAllClassAsync(string? name = null, int? subjectId = null, int? semesterId = null, int pageNumber = 1, int pageSize = 5)
        {
            var query = _context.Classes
                .Include(c => c.Subject)
                .Include(c => c.Semester)
                .Include(c => c.ClassStudents)
                .AsQueryable();

            // Lọc theo tên lớp, môn, kỳ nếu có
            if (!string.IsNullOrWhiteSpace(name))
            {
                var lowered = name.ToLower();
                query = query.Where(c =>
                    c.ClassName.ToLower().Contains(lowered) ||
                    (c.Subject != null && c.Subject.SubjectName.ToLower().Contains(lowered)) ||
                    (c.Semester != null && c.Semester.SemesterName.ToLower().Contains(lowered))
                );
            }

            // Lọc theo SubjectId nếu có
            if (subjectId.HasValue)
            {
                query = query.Where(c => c.SubjectId == subjectId.Value);
            }

            // Lọc theo SemesterId nếu có
            if (semesterId.HasValue)
            {
                query = query.Where(c => c.SemesterId == semesterId.Value);
            }

            query = query
                .OrderByDescending(c => c.ClassId)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);

            var result = await query.ToListAsync();

            return result.Select(c => new ClassListDTO
            {
                ClassId = c.ClassId,
                ClassName = c.ClassName,
                SubjectName = c.Subject?.SubjectName ?? "",
                SemesterName = c.Semester?.SemesterName ?? "",
                StudentCount = c.ClassStudents?.Count ?? 0
            });
        }



        public async Task<IEnumerable<Class>> GetAllClassesAsync()
        {
            var classes = _context.Classes.Include(c => c.Subject).Include(c => c.Teacher).Include(c => c.Semester)
                 .ToListAsync();
            return await classes;
        }
        public async Task<int> CountPageAsync(string? name = null, int? subjectId = null, int? semesterId = null, int pageSize = 5)
        {
            IQueryable<Class> query = _context.Classes
                .Include(c => c.Subject)
                .Include(c => c.Semester);

            if (!string.IsNullOrWhiteSpace(name))
            {
                var loweredName = name.ToLower();
                query = query.Where(c =>
                    c.ClassName.ToLower().Contains(loweredName) ||
                    (c.Subject != null && c.Subject.SubjectName.ToLower().Contains(loweredName)) ||
                    (c.Semester != null && c.Semester.SemesterName.ToLower().Contains(loweredName)));
            }

            if (subjectId.HasValue)
            {
                query = query.Where(c => c.SubjectId == subjectId.Value);
            }

            if (semesterId.HasValue)
            {
                query = query.Where(c => c.SemesterId == semesterId.Value);
            }

            var totalCount = await query.CountAsync();
            return (int)Math.Ceiling((double)totalCount / pageSize);
        }


        public async Task<IEnumerable<ClassListDTO>> GetAllClassByTeacherIdAsync(Guid teacherId, string? name = null, int? subjectId = null, int? semesterId = null, int pageNumber = 1, int pageSize = 5)
        {
            var query = _context.Classes
                .Include(c => c.Subject)
                .Include(c => c.Semester)
                .Include(c => c.ClassStudents)
                .Where(c => c.TeacherId == teacherId) // lọc theo giáo viên
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                var lowered = name.ToLower();
                query = query.Where(c =>
                    c.ClassName.ToLower().Contains(lowered) ||
                    (c.Subject != null && c.Subject.SubjectName.ToLower().Contains(lowered)) ||
                    (c.Semester != null && c.Semester.SemesterName.ToLower().Contains(lowered))
                );
            }

            if (subjectId.HasValue)
            {
                query = query.Where(c => c.SubjectId == subjectId.Value);
            }

            if (semesterId.HasValue)
            {
                query = query.Where(c => c.SemesterId == semesterId.Value);
            }

            query = query
                .OrderByDescending(c => c.ClassId)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);

            var result = await query.ToListAsync();

            return result.Select(c => new ClassListDTO
            {
                ClassId = c.ClassId,
                ClassName = c.ClassName,
                SubjectName = c.Subject?.SubjectName ?? "",
                SemesterName = c.Semester?.SemesterName ?? "",
                StudentCount = c.ClassStudents?.Count ?? 0
            });
        }
        public async Task<int> CountPageByTeacherAsync(Guid teacherId, string? name = null, int? subjectId = null, int? semesterId = null, int pageSize = 5)
        {
            var query = _context.Classes
                .Include(c => c.Subject)
                .Include(c => c.Semester)
                .Where(c => c.TeacherId == teacherId)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                var lowered = name.ToLower();
                query = query.Where(c =>
                    c.ClassName.ToLower().Contains(lowered) ||
                    (c.Subject != null && c.Subject.SubjectName.ToLower().Contains(lowered)) ||
                    (c.Semester != null && c.Semester.SemesterName.ToLower().Contains(lowered)));
            }

            if (subjectId.HasValue)
            {
                query = query.Where(c => c.SubjectId == subjectId.Value);
            }

            if (semesterId.HasValue)
            {
                query = query.Where(c => c.SemesterId == semesterId.Value);
            }

            var totalCount = await query.CountAsync();
            return (int)Math.Ceiling((double)totalCount / pageSize);
        }
        public async Task<bool> CheckIfStudentInClassAsync(int classId, Guid studentId)
        {
            return await _context.ClassStudents
                .AnyAsync(cs => cs.ClassId == classId && cs.StudentId == studentId);
        }

    }
}
