using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.PracticeQuestionDTO;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class PracticeQuestionsRepository : BaseRepository<PracticeQuestion>, IPracticeQuestionsRepository
    {
        private readonly GessDbContext _context;
        public PracticeQuestionsRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PracticeQuestionLitsDTO>> GetAllPracticeQuestionsAsync(int chapterId)
        {
            var practiceQuestions = await _context.PracticeQuestions
                .Include(q => q.Chapter)
                .Include(q => q.CategoryExam)
                .Include(q => q.LevelQuestion)
                .Include(q => q.Semester)
                .Include(q => q.PracticeAnswer)
                .Where(q => q.ChapterId == chapterId) 
                .ToListAsync();

            return practiceQuestions.Select(q => new PracticeQuestionLitsDTO
            {
                PracticeQuestionId = q.PracticeQuestionId,
                Content = q.Content,
                UrlImg = q.UrlImg,
                IsActive = q.IsActive,
                CreatedBy = q.CreatedBy,
                IsPublic = q.IsPublic,
                ChapterName = q.Chapter != null ? q.Chapter.ChapterName : "",
                CategoryExamName = q.CategoryExam != null ? q.CategoryExam.CategoryExamName : "",
                LevelQuestionName = q.LevelQuestion != null ? q.LevelQuestion.LevelQuestionName : "",
                SemesterName = q.Semester != null ? q.Semester.SemesterName : ""
            }).ToList();
        }
    }
}

