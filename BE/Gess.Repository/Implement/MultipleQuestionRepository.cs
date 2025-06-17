using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
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
    public class MultipleQuestionRepository : BaseRepository<MultiQuestion>, IMultipleQuestionRepository
    {
        private readonly GessDbContext _context;
        public MultipleQuestionRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<int> GetQuestionCountAsync(int? chapterId, int? categoryId, int? levelId, bool? isPublic, string? createdBy)
        {
            var query = _context.MultiQuestions.AsQueryable();
            if (chapterId.HasValue)
            {
                query = query.Where(q => q.ChapterId == chapterId.Value);
            }
            if (categoryId.HasValue)
            {
                query = query.Where(q => q.CategoryExamId == categoryId.Value);
            }
            if (levelId.HasValue)
            {
                query = query.Where(q => q.LevelQuestionId == levelId.Value);
            }
            if (isPublic.HasValue)
            {
                query = query.Where(q => q.IsPublic == isPublic.Value);
            }
            if (!string.IsNullOrEmpty(createdBy))
            {
                query = query.Where(q => q.CreatedBy == createdBy);
            }
            try
            {
                return await query.CountAsync();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("An error occurred while retrieving the question count.", ex);
            }

        }
    }
    
    
}
