using Gess.Repository.Infrastructures;
using GESS.Common;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.SemestersDTO;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class SemesterRepository : BaseRepository<Semester>, ISemesterRepository
    {
        private readonly GessDbContext _context;
        public SemesterRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Semester>> GetAllAsync(Expression<Func<Semester, bool>> filter)
        {
            return await _context.Semesters.Where(filter).ToListAsync();
        }

        public async Task<List<SemesterListDTO>> GetAllChooseSemesterAsync()
        {
            return await _context.Semesters
                .Where(s => s.IsActive == true)
                .Select(s => new SemesterListDTO
                {
                    SemesterId = s.SemesterId,
                    SemesterName = s.SemesterName
                }).ToListAsync();
        }

        public async Task AddRangeAsync(List<Semester> entities)
        {
            await _context.Semesters.AddRangeAsync(entities);
        }

        public async Task UpdateRangeAsync(List<Semester> entities)
        {
            _context.Semesters.UpdateRange(entities);
        }

        public async Task<List<Semester>> GetAllEntitiesAsync()
        {
            return await _context.Semesters.ToListAsync();
        }

        public async Task<List<SemesterResponse>> GetSemestersByYearAsync(int year, Guid userId)
        {
            var semesters = await _context.Semesters
                .Where(s => s.IsActive
                    && s.MultiExams.Any(me => me.MultiExamHistories.Any(meh => meh.Student.StudentId == userId
                        && meh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM
                        && me.CreateAt.Year == year))
                    || s.PracticeExams.Any(pe => pe.PracticeExamHistories.Any(peh => peh.Student.StudentId == userId
                        && peh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM
                        && pe.CreateAt.Year == year)))
                .Select(s => new SemesterResponse
                {
                    SemesterId = s.SemesterId,
                    SemesterName = s.SemesterName
                })
                .Distinct()
                .ToListAsync();

            return semesters;
        }

    }
}
