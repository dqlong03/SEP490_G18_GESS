using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.PracticeExamPaper;
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
    public class FinalExamPaperRepository : IFinalExamPaperRepository
    {
        private readonly GessDbContext _context;
        public FinalExamPaperRepository(GessDbContext context)
        {
            _context = context;
        }

        public async Task<int> CountPageNumberFinalExamQuestion(int? semesterId, int? chapterId, int? levelId, string? textSearch, int pageSize)
        {
            var query = _context.PracticeQuestions
                .Where(q => q.CategoryExamId == 2 && q.IsActive && q.IsPublic);
            if (semesterId.HasValue)
            {
                query = query.Where(q => q.SemesterId == semesterId.Value);
            }
            if (chapterId.HasValue)
            {
                query = query.Where(q => q.ChapterId == chapterId.Value);
            }
            if (levelId.HasValue)
            {
                query = query.Where(q => q.LevelQuestionId == levelId.Value);
            }
            if (!string.IsNullOrEmpty(textSearch))
            {
                query = query.Where(q => q.Content.Contains(textSearch));
            }
            var totalCount = await query.CountAsync();
            if (totalCount < 0)
            {
                throw new InvalidOperationException("Failed to count the number of final exam questions.");
            }
            return (int)Math.Ceiling((double)totalCount / pageSize);
        }

        public async Task<FinalPracticeExamPaperCreateRequest> CreateFinalExamPaperAsync(FinalPracticeExamPaperCreateRequest finalExamPaperCreateDto)
        {
            // Tạo các PracticeQuestion từ manualQuestions
            var createdQuestions = new List<PracticeQuestion>();
            foreach (var mq in finalExamPaperCreateDto.ManualQuestions)
            {
                int levelId = mq.Level switch
                {
                    "Dễ" => 1,
                    "Trung bình" => 2,
                    "Khó" => 3,
                    _ => 2
                };
                var pq = new PracticeQuestion
                {
                    Content = mq.Content,
                    UrlImg = null,
                    IsActive = true,
                    ChapterId = mq.ChapterId,
                    CategoryExamId = 2,//Mac dinh la cuoi ky
                    LevelQuestionId = levelId,
                    SemesterId = finalExamPaperCreateDto.SemesterId,
                    CreateAt = DateTime.UtcNow,
                    CreatedBy = finalExamPaperCreateDto.TeacherId,
                    IsPublic = true
                };
                _context.PracticeQuestions.Add(pq);
                createdQuestions.Add(pq);
            }
            await _context.SaveChangesAsync();

            // Tạo PracticeAnswer cho từng manualQuestion

            foreach (var (pq, mq) in createdQuestions.Zip(finalExamPaperCreateDto.ManualQuestions))
            {
                var answer = new PracticeAnswer
                {
                    AnswerContent = mq.Criteria,
                    PracticeQuestionId = pq.PracticeQuestionId,
                    GradingCriteria = mq.Criteria
                };
                _context.PracticeAnswers.Add(answer);
            }
            await _context.SaveChangesAsync();

            //Tạo PracticeExamPaper
            var examPaper = new PracticeExamPaper
            {
                PracExamPaperName = finalExamPaperCreateDto.ExamName,
                NumberQuestion = finalExamPaperCreateDto.TotalQuestion,
                CreateAt = DateTime.UtcNow,
                TeacherId = finalExamPaperCreateDto.TeacherId,
                CategoryExamId = 2,
                SubjectId = finalExamPaperCreateDto.SubjectId,
                SemesterId = finalExamPaperCreateDto.SemesterId,
                Status = "Published"
            };
            _context.PracticeExamPapers.Add(examPaper);

            await _context.SaveChangesAsync();
            // Thêm PracticeTestQuestion (manual + selected) và set QuestionOrder
            var allQuestions = createdQuestions
                .Select((q, idx) => new { q.PracticeQuestionId, Score = finalExamPaperCreateDto.ManualQuestions[idx].Score })
                .Concat(finalExamPaperCreateDto.SelectedQuestions.Select(sq => new { sq.PracticeQuestionId, sq.Score }))
                .ToList();

            for (int i = 0; i < allQuestions.Count; i++)
            {
                var q = allQuestions[i];
                var testQuestion = new PracticeTestQuestion
                {
                    PracExamPaperId = examPaper.PracExamPaperId,
                    PracticeQuestionId = q.PracticeQuestionId,
                    Score = q.Score,
                    QuestionOrder = i + 1
                };
                _context.PracticeTestQuestions.Add(testQuestion);
            }
            await _context.SaveChangesAsync();
            return new FinalPracticeExamPaperCreateRequest
            {
                ExamName = examPaper.PracExamPaperName
            };
        }

        public async Task<List<PracticeQuestionExamPaperDTO>> GetFinalPracticeQuestion(
    int? semesterId, int? chapterId, int? levelId, string? textSearch, int pageNumber, int pageSize)
        {
            var query = _context.PracticeQuestions
                        .Include(q => q.LevelQuestion) 
                        .Where(q => q.CategoryExamId == 2 && q.IsActive && q.IsPublic);

            if (semesterId.HasValue)
            {
                query = query.Where(q => q.SemesterId == semesterId.Value);
            }

            if (chapterId.HasValue)
            {
                query = query.Where(q => q.ChapterId == chapterId.Value);
            }

            if (levelId.HasValue)
            {
                query = query.Where(q => q.LevelQuestionId == levelId.Value);
            }

            if (!string.IsNullOrEmpty(textSearch))
            {
                query = query.Where(q => q.Content.Contains(textSearch));
            }

            var questions = await query
                .OrderBy(q => q.PracticeQuestionId)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(q => new PracticeQuestionExamPaperDTO
                {
                    Id = q.PracticeQuestionId,
                    Content = q.Content,
                    Level = q.LevelQuestion.LevelQuestionName
                })
                .ToListAsync();

            return questions;
        }

    }
}
