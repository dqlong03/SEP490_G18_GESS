using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Subject;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace GESS.Repository.Implement
{
    public class CategoryExamRepository : BaseRepository<CategoryExam>, ICategoryExamRepository
    {
        private readonly GessDbContext _context;
        public CategoryExamRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CategoryExam>> GetAllAsync(int subjectId)
        {
            var query = _context.CategoryExamSubjects
                .Include(ces => ces.CategoryExam)
                .Where(ces => ces.SubjectId == subjectId && ces.IsDelete==false)
                .Select(ces => ces.CategoryExam)
                .AsNoTracking();
            return await Task.FromResult(query.AsEnumerable());
        }

        // ThaiNH_add_UpdateMark&UserProfile_Begin
        public async Task<IEnumerable<CategoryExam>> GetAllAsync()
        {
            return await Task.FromResult(_context.CategoryExams.ToList());
        }
        // ThaiNH_add_UpdateMark&UserProfile_End

    }


}
