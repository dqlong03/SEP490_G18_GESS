using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.PracticeExamPaper;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace GESS.Repository.Implement
{
    public class PracticeExamPaperRepository : BaseRepository<PracticeExamPaper>, IPracticeExamPaperRepository
    {
        private readonly GessDbContext _context;

        public PracticeExamPaperRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }
        public async Task<IEnumerable<PracticeExamPaper>> GetAllPracticeExamPapersAsync(int? subjectId, int? categoryId, Guid? teacherId)
        {
            var query = _context.PracticeExamPapers.AsQueryable();

            if (subjectId.HasValue)
                query = query.Where(p => p.SubjectId == subjectId.Value);

            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryExamId == categoryId.Value);

            if (teacherId.HasValue && teacherId.Value != Guid.Empty)
                query = query.Where(p => p.TeacherId == teacherId.Value);

            var practiceExamPapers = await query.ToListAsync();
            return practiceExamPapers;
        }

        public async Task<List<ExamPaperListDTO>> GetAllExamPaperListAsync(
            string? searchName = null,
            int? subjectId = null,
            int? semesterId = null,
            int? categoryExamId = null,
            int page = 1,
            int pageSize = 5
        )
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 5;

            var query = _context.PracticeExamPapers
                .Include(x => x.CategoryExam)
                .Include(x => x.Subject)
                .Include(x => x.Semester)
                .AsNoTracking() // Tối ưu hóa nếu không cần theo dõi thay đổi
                .AsQueryable();

            // Áp dụng các bộ lọc
            if (!string.IsNullOrWhiteSpace(searchName))
            {
                query = query.Where(x => x.PracExamPaperName.Contains(searchName));
            }
            if (subjectId.HasValue)
            {
                query = query.Where(x => x.SubjectId == subjectId.Value);
            }
            if (semesterId.HasValue)
            {
                query = query.Where(x => x.SemesterId == semesterId.Value);
            }
            if (categoryExamId.HasValue)
            {
                query = query.Where(x => x.CategoryExamId == categoryExamId.Value); // Đảm bảo ánh xạ đúng
            }

            // Đếm tổng số bản ghi trước khi phân trang
            var totalItems = await query.CountAsync();

            // Áp dụng phân trang
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ExamPaperListDTO
        {
                    PracExamPaperId = x.PracExamPaperId,
                    PracExamPaperName = x.PracExamPaperName,
                    NumberQuestion = x.NumberQuestion,
                    CreateAt = x.CreateAt,
                    Status = x.Status,
                    //CreateBy = x.CreateBy,
                    CategoryExamName = x.CategoryExam.CategoryExamName,
                    SubjectName = x.Subject.SubjectName,
                    SemesterName = x.Semester.SemesterName
                })
                 .ToListAsync();

            return items;
        }
        public async Task<PracticeExamPaper> CreateWithQuestionsAsync(PracticeExamPaper examPaper, List<PracticeQuestion> questions, List<PracticeTestQuestion> testQuestions)
        {
            await _context.PracticeExamPapers.AddAsync(examPaper);
            await _context.PracticeQuestions.AddRangeAsync(questions);
            await _context.PracticeTestQuestions.AddRangeAsync(testQuestions);
            await _context.SaveChangesAsync();
            return examPaper;
        }

        public async Task<PracticeExamPaper> CreateAsync(PracticeExamPaper entity)
        {
            await _context.PracticeExamPapers.AddAsync(entity);
            await _context.SaveChangesAsync(); 
            return entity;
        }

        public async Task<List<PracticeTestQuestion>> CreateTestQuestionsAsync(List<PracticeTestQuestion> testQuestions)
        {
            await _context.PracticeTestQuestions.AddRangeAsync(testQuestions);
            await _context.SaveChangesAsync();
            await _context.SaveChangesAsync();
            return testQuestions;
        }
        public async Task<int> CountPageAsync(string? name = null, int? subjectId = null, int? semesterId = null, int? categoryExamId = null, int pageSize = 5)
        {
            if (pageSize < 1) pageSize = 5;

            var query = _context.PracticeExamPapers
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(x => x.PracExamPaperName.Contains(name));
            }
            if (subjectId.HasValue)
            {
                query = query.Where(x => x.SubjectId == subjectId.Value);
            }
            if (semesterId.HasValue)
            {
                query = query.Where(x => x.SemesterId == semesterId.Value);
        }
            if (categoryExamId.HasValue)
            {
                query = query.Where(x => x.CategoryExamId == categoryExamId.Value);
    }
    
            var totalItems = await query.CountAsync();
            return (int)Math.Ceiling((double)totalItems / pageSize);
        }
        public async Task<List<ListPracticeQuestion>> GetPracticeQuestionsAsync(Guid teacherId)
        {
            var questions = await _context.PracticeQuestions
                .Where(q => q.IsPublic || q.CreatedBy == teacherId)
                .Include(q => q.LevelQuestion)
                .Include(q => q.Chapter)
                .Select(q => new ListPracticeQuestion
                {
                    PracticeQuestion = q.PracticeQuestionId,
                    Content = q.Content,
                    Level = q.LevelQuestion.LevelQuestionName,
                    ChapterName = q.Chapter.ChapterName
                })
                .ToListAsync();

            return questions;
        }
        public async Task<List<ListPracticeQuestion>> GetPublicPracticeQuestionsAsync(string? search = null, int? levelQuestionId = null)
        {
            var query = _context.PracticeQuestions
                .Where(q => q.IsPublic)
                .Include(q => q.LevelQuestion)
                .Include(q => q.Chapter)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(q => q.Content.Contains(search));
            }

            if (levelQuestionId.HasValue)
            {
                query = query.Where(q => q.LevelQuestionId == levelQuestionId.Value);
            }

            return await query
                .Select(q => new ListPracticeQuestion
                {
                    PracticeQuestion = q.PracticeQuestionId,
                    Content = q.Content,
                    Level = q.LevelQuestion.LevelQuestionName,
                    ChapterName = q.Chapter.ChapterName
                })
                .ToListAsync();
        }



        public async Task<List<ListPracticeQuestion>> GetPrivatePracticeQuestionsAsync(Guid teacherId, string? search = null, int? levelQuestionId = null)
        {
            var query = _context.PracticeQuestions
                .Where(q => !q.IsPublic && q.CreatedBy == teacherId)
                .Include(q => q.LevelQuestion)
                .Include(q => q.Chapter)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(q => q.Content.Contains(search));
            }

            if (levelQuestionId.HasValue)
            {
                query = query.Where(q => q.LevelQuestionId == levelQuestionId.Value);
            }

            return await query
                .Select(q => new ListPracticeQuestion
                {
                    PracticeQuestion = q.PracticeQuestionId,
                    Content = q.Content,
                    Level = q.LevelQuestion.LevelQuestionName,
                    ChapterName = q.Chapter.ChapterName
                })
                .ToListAsync();
        }

        public async Task<PracticeExamPaperDetailDTO> GetExamPaperDetailAsync(int examPaperId)
        {
            var examPaper = await _context.PracticeExamPapers
                .Include(x => x.Subject)
                .Include(x => x.Semester)
                .Include(x => x.CategoryExam)
                .Include(x => x.PracticeTestQuestions)
                    .ThenInclude(ptq => ptq.PracticeQuestion)
                        .ThenInclude(pq => pq.PracticeAnswer)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.PracExamPaperId == examPaperId);

            if (examPaper == null)
                throw new Exception("Không tìm thấy đề thi.");

            return new PracticeExamPaperDetailDTO
            {
                PracExamPaperId = examPaper.PracExamPaperId,
                PracExamPaperName = examPaper.PracExamPaperName,
                CreateAt = examPaper.CreateAt,
                SubjectName = examPaper.Subject?.SubjectName ?? "N/A",
                SemesterName = examPaper.Semester?.SemesterName ?? "N/A",
                CategoryExamName = examPaper.CategoryExam?.CategoryExamName ?? "N/A",
                Status = examPaper.Status,
                Questions = examPaper.PracticeTestQuestions
                    .OrderBy(q => q.QuestionOrder)
                    .Select(q => new PracticeExamQuestionDetailDTO
                    {
                        QuestionOrder = q.QuestionOrder,
                        Content = q.PracticeQuestion.Content,
                        AnswerContent = q.PracticeQuestion.PracticeAnswer?.AnswerContent,
                        Score = q.Score
                    })
                    .ToList()
            };
        }



    }
}
