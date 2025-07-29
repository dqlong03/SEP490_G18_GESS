using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.MultipleQuestionDTO;
using GESS.Model.PracticeQuestionDTO;
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

        public async Task<IEnumerable<MultipleQuestionListDTO>> GetAllMultipleQuestionsAsync()
        {
            var multipleQuestions = await _context.MultiQuestions
               .Include(q => q.Chapter)
               .Include(q => q.CategoryExam)
               .Include(q => q.LevelQuestion)
               .Include(q => q.Semester)
               .Include(q => q.MultiAnswers)
               .ToListAsync();


            return multipleQuestions.Select(q => new MultipleQuestionListDTO
            {
                PracticeQuestionId = q.MultiQuestionId,
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

        public async Task<int> GetQuestionCountAsync(int? chapterId, int? categoryId, int? levelId, bool? isPublic, Guid? createdBy)
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
            if (createdBy.HasValue)
            {
                query = query.Where(q => q.CreatedBy == createdBy.Value);
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

        public async Task<List<QuestionMultiExamSimpleDTO>> GetAllQuestionMultiExamByMultiExamIdAsync(int multiExamId)
        {
            return await _context.QuestionMultiExams
                .Where(q => q.MultiExamHistory.MultiExamId == multiExamId)
                .Select(q => new QuestionMultiExamSimpleDTO
                {
                    Id = q.MultiQuestionId, 
                    QuestionOrder = q.QuestionOrder
                })
                .ToListAsync();
        }

        public async Task<int> GetFinalQuestionCount(int? chapterId, int? levelId, int ? semesterId)
        {
            var query = _context.MultiQuestions.AsQueryable();
            query = query.Where(q => q.CategoryExam.CategoryExamName.Equals("Thi cuối kỳ"));
            if (chapterId.HasValue)
            {
                query = query.Where(q => q.ChapterId == chapterId.Value);
            }
            if (levelId.HasValue)
            {
                query = query.Where(q => q.LevelQuestionId == levelId.Value);
            }
            if (semesterId.HasValue)
            {
                query = query.Where(q => q.SemesterId == semesterId.Value);
            }
            try
            {
                return await query.CountAsync();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("An error occurred while retrieving the final question count.", ex);
            }
        }
    }


}
