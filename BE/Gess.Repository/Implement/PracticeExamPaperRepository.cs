using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.MultiExamHistories;
using GESS.Model.MultipleExam;
using GESS.Model.TrainingProgram;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class PracticeExamPaperRepository : BaseRepository<PracticeExamPaper>, IPracticeExamPaperRepository
    {
        private readonly GessDbContext _context;
        public PracticeExamPaperRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PracticeExamPaper>> GetAllPracticeExamPapersAsync(int subjectId, int categoryId, Guid teacherId)
        {
            var practiceExamPapers = await _context.PracticeExamPapers
                 .Where(p => p.SubjectId == subjectId && p.CategoryExamId == categoryId && p.TeacherId == teacherId)
                 .ToListAsync();
            return practiceExamPapers;
        }
    }
    
    
}
