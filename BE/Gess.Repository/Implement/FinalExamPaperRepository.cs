using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.PracticeExamPaper;
using GESS.Repository.Interface;
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
                Status= "Published"
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
    }
}
