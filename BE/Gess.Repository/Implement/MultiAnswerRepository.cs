using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.MultipleQuestionDTO;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class MultiAnswerRepository : BaseRepository<MultiAnswer>, IMultipleAnswerRepository
    {
        private readonly GessDbContext _context;
        public MultiAnswerRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<MultiAnswerOfQuestionDTO>> GetAllMultiAnswerOfQuestionAsync(int multiQuestionId)
        {
            return await _context.MultiAnswers
                .Where(a => a.MultiQuestionId == multiQuestionId)
                .Select(a => new MultiAnswerOfQuestionDTO
                {
                    AnswerId = a.AnswerId,
                    QuestionName = a.MultiQuestion.Content,
                    AnswerContent = a.AnswerContent,
                    IsCorrect = a.IsCorrect
                })
                .ToListAsync();
        }
    }
}
