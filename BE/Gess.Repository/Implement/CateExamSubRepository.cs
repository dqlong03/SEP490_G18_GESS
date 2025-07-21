using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.GradeComponent;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

// ThaiNH_Create_UserProfile
namespace GESS.Repository.Implement
{
    public class CateExamSubRepository : BaseRepository<CategoryExamSubject>, ICateExamSubRepository
    {
        private readonly GessDbContext _context;
        public CateExamSubRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task AddCateExamSubAsync(CategoryExamSubject entity)
         => await _context.CategoryExamSubjects.AddAsync(entity);


        public async Task DeleteCateExamSubAsync(CategoryExamSubject entity)
          => _context.CategoryExamSubjects.RemoveRange(entity);


        public async Task DeleteCESBySubjectIdAsync(int subjectId)
        {
            var entities = _context.CategoryExamSubjects
            .Where(ces => ces.SubjectId == subjectId);
            _context.CategoryExamSubjects.RemoveRange(entities);
        }

        public async Task<IEnumerable<CategoryExamSubject>> GetAllCateExamSubAsync()
         => await _context.CategoryExamSubjects.ToListAsync();
        
        public async Task UpdateAllCESBySubIdAsync(List<CategoryExamSubject> entities)
         => _context.CategoryExamSubjects.UpdateRange(entities);

        // ThaiNH_add_UpdateMark&UserProfile_Begin
        public async Task<IEnumerable<CategoryExamSubjectDTO>> GetAllCateExamSubBySubIdAsync(int subjectId)
        =>   await _context.CategoryExamSubjects
        .Where(x => x.SubjectId == subjectId)
        .Select(x => new CategoryExamSubjectDTO
        {
            CategoryExamId = x.CategoryExamId,
            SubjectId = x.SubjectId,
            CategoryExamName = x.CategoryExam.CategoryExamName,
            GradeComponent = x.GradeComponent,
            
    }).ToListAsync();
        // ThaiNH_add_UpdateMark&UserProfile_End

        public async Task<CategoryExamSubject> GetBySubIdAndCateEIdAsync(int subjectId , int categoryExamId)
           => await _context.CategoryExamSubjects.FirstOrDefaultAsync(x => x.CategoryExamId == categoryExamId && x.SubjectId == subjectId);



        public async Task UpdateCateExamSubAsync(CategoryExamSubject entity)
          =>  _context.CategoryExamSubjects.Update(entity);
    }
}
