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


        //<tuan>-------------------------------------------

        public async Task<(IEnumerable<QuestionBankListDTO> Data, int TotalCount)> GetAllQuestionsAsync(
     int? majorId, int? subjectId, int? chapterId, bool? isPublic, int? levelId, string? questionType, int pageNumber, int pageSize)
        {
            // Lấy danh sách chapterId theo majorId hoặc subjectId nếu có
            List<int> chapterIds = null;

            if (majorId.HasValue)
            {
                var trainingProgramIds = _context.TrainingPrograms
                    .Where(tp => tp.MajorId == majorId.Value)
                    .Select(tp => tp.TrainProId)
                    .ToList();

                var subjectIds = _context.SubjectTrainingPrograms
                    .Where(stp => trainingProgramIds.Contains(stp.TrainProId))
                    .Select(stp => stp.SubjectId)
                    .Distinct()
                    .ToList();

                chapterIds = _context.Chapters
                    .Where(c => subjectIds.Contains(c.SubjectId))
                    .Select(c => c.ChapterId)
                    .ToList();
            }
            else if (subjectId.HasValue)
            {
                chapterIds = _context.Chapters
                    .Where(c => c.SubjectId == subjectId.Value)
                    .Select(c => c.ChapterId)
                    .ToList();
            }

            // Truy vấn entity MultiQuestion
            var multipleQuery = _context.MultiQuestions
                .Include(q => q.LevelQuestion)
                .Include(q => q.Chapter)
                .Include(q => q.MultiAnswers)
                .Where(q =>
                    (chapterId != null && q.ChapterId == chapterId) ||
                    (chapterId == null && chapterIds != null && chapterIds.Contains(q.ChapterId)) ||
                    (chapterId == null && chapterIds == null)
                )
                .Where(q =>
                    (isPublic == null || q.IsPublic == isPublic) &&
                    (levelId == null || q.LevelQuestionId == levelId) &&
                    (questionType == null || questionType == "multiple")
                );

            // Truy vấn entity PracticeQuestion
            var essayQuery = _context.PracticeQuestions
                .Include(q => q.LevelQuestion)
                .Include(q => q.Chapter)
                .Include(q => q.PracticeAnswer)
                .Where(q =>
                    (chapterId != null && q.ChapterId == chapterId) ||
                    (chapterId == null && chapterIds != null && chapterIds.Contains(q.ChapterId)) ||
                    (chapterId == null && chapterIds == null)
                )
                .Where(q =>
                    (isPublic == null || q.IsPublic == isPublic) &&
                    (levelId == null || q.LevelQuestionId == levelId) &&
                    (questionType == null || questionType == "essay")
                );

            // Lấy dữ liệu entity ra memory, sau đó chuyển sang DTO và hợp nhất
            var multipleList = await multipleQuery.ToListAsync();
            var essayList = await essayQuery.ToListAsync();

            var allQuestions = multipleList
                .Select(q => new QuestionBankListDTO
                {
                    QuestionId = q.MultiQuestionId,
                    Content = q.Content,
                    QuestionType = "Trắc nghiệm",
                    Level = q.LevelQuestion?.LevelQuestionName,
                    Chapter = q.Chapter?.ChapterName,
                    Answers = q.MultiAnswers?.Select(a => new AnswerDTO
                    {
                        AnswerId = a.AnswerId,
                        Content = a.AnswerContent,
                        IsCorrect = a.IsCorrect
                    }).ToList() ?? new List<AnswerDTO>()
                })
                .Concat(
                    essayList.Select(q => new QuestionBankListDTO
                    {
                        QuestionId = q.PracticeQuestionId,
                        Content = q.Content,
                        QuestionType = "Tự luận",
                        Level = q.LevelQuestion?.LevelQuestionName,
                        Chapter = q.Chapter?.ChapterName,
                        Answers = q.PracticeAnswer != null
                            ? new List<AnswerDTO>
                            {
                        new AnswerDTO
                        {
                            AnswerId = q.PracticeAnswer.AnswerId,
                            Content = q.PracticeAnswer.AnswerContent,
                            IsCorrect = true
                        }
                            }
                            : new List<AnswerDTO>()
                    })
                )
                .OrderBy(q => q.QuestionId);

            var totalCount = allQuestions.Count();
            var data = allQuestions
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return (data, totalCount);
        }



        // API lấy danh sách câu hỏi thực hành
        public async Task<(IEnumerable<PracticeQuestionExamPaperDTO> Data, int TotalCount)> GetPracticeQuestionsAsync(
        int classId, string? content, int? levelId, int? chapterId, int page, int pageSize)
        {
            var query = _context.PracticeQuestions
                .Where(q => q.Chapter.Subject.Classes.Any(c => c.ClassId == classId));

            if (!string.IsNullOrEmpty(content))
                query = query.Where(q => q.Content.Contains(content));

            if (levelId.HasValue)
                query = query.Where(q => q.LevelQuestionId == levelId.Value);

            if (chapterId.HasValue)
                query = query.Where(q => q.ChapterId == chapterId.Value);

            int total = await query.CountAsync();

            var data = await query
                .OrderBy(q => q.PracticeQuestionId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(q => new PracticeQuestionExamPaperDTO
                {
                    Id = q.PracticeQuestionId,
                    Content = q.Content,
                    Level = q.LevelQuestion.LevelQuestionName
                })
                .ToListAsync();

            return (data, total);
        }


        //---------------------------------------



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

