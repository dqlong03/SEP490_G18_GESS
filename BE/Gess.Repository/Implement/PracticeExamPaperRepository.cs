using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.PracticeExamPaper;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class PracticeExamPaperRepository : BaseRepository<PracticeExamPaper>, IPracticeExamPaperRepository
    {
        private readonly GessDbContext _context;

        public PracticeExamPaperRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }


        /// Tạo đề thi thực hành với các câu hỏi thủ công và đã chọn
        public async Task<PracticeExamPaperCreateResponse> CreateExamPaperAsync(PracticeExamPaperCreateRequest request)
        {
            try
            {
                // 1. Lấy SemesterId mới nhất
                var semester = _context.Semesters.OrderByDescending(s => s.SemesterId).FirstOrDefault();
                if (semester == null) throw new InvalidOperationException("Không tìm thấy học kỳ.");

                // 2. Lấy SubjectId từ ClassId
                var classEntity = await _context.Classes.FindAsync(request.ClassId);
                if (classEntity == null) throw new InvalidOperationException("Không tìm thấy lớp học.");
                int subjectId = classEntity.SubjectId;

            // 3. Tạo các PracticeQuestion từ manualQuestions
            var createdQuestions = new List<PracticeQuestion>();
            foreach (var mq in request.ManualQuestions)
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
                    CategoryExamId = request.CategoryExamId,
                    LevelQuestionId = levelId,
                    SemesterId = request.SemesterId,
                    CreateAt = DateTime.UtcNow,
                    CreatedBy = request.TeacherId,
                    IsPublic = true
                };
                _context.PracticeQuestions.Add(pq);
                createdQuestions.Add(pq);
            }
            await _context.SaveChangesAsync();

            // 4. Tạo PracticeAnswer cho từng manualQuestion
            foreach (var (pq, mq) in createdQuestions.Zip(request.ManualQuestions))
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

            // 5. Tạo PracticeExamPaper
            var examPaper = new PracticeExamPaper
            {
                PracExamPaperName = request.ExamName,
                NumberQuestion = request.TotalQuestion,
                CreateAt = DateTime.UtcNow,
                TeacherId = request.TeacherId,
                CategoryExamId = request.CategoryExamId,
                SubjectId = subjectId,
                SemesterId = request.SemesterId,
                Status = "Published"
            };
            _context.PracticeExamPapers.Add(examPaper);
            await _context.SaveChangesAsync();

            // 6. Thêm PracticeTestQuestion (manual + selected) và set QuestionOrder
            var allQuestions = createdQuestions
                .Select((q, idx) => new { q.PracticeQuestionId, Score = request.ManualQuestions[idx].Score })
                .Concat(request.SelectedQuestions.Select(sq => new { sq.PracticeQuestionId, sq.Score }))
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

            return new PracticeExamPaperCreateResponse
            {
                PracExamPaperId = examPaper.PracExamPaperId,
                Message = "Tạo đề thi thành công"
            };
            }
            catch (InvalidOperationException ex)
            {
                throw;
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
            {
                throw new InvalidOperationException($"Lỗi database khi tạo đề thi: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi không xác định khi tạo đề thi: {ex.Message}", ex);
            }
        }


        public async Task<IEnumerable<PracticeExamPaper>> GetAllPracticeExamPapersAsync(
        int? subjectId, int? categoryId, Guid? teacherId, int? semesterId, string? year)
        {
            try
            {
                var query = _context.PracticeExamPapers
                    .Include(p => p.Semester) // Lấy luôn thông tin học kỳ
                    .AsQueryable();

                if (subjectId.HasValue)
                    query = query.Where(p => p.SubjectId == subjectId.Value);

                if (categoryId.HasValue)
                    query = query.Where(p => p.CategoryExamId == categoryId.Value);

                if (teacherId.HasValue && teacherId.Value != Guid.Empty)
                    query = query.Where(p => p.TeacherId == teacherId.Value);

                if (semesterId.HasValue)
                    query = query.Where(p => p.SemesterId == semesterId.Value);

                if (!string.IsNullOrWhiteSpace(year))
                    query = query.Where(p => p.CreateAt.Year.ToString() == year);

                var practiceExamPapers = await query.ToListAsync();
                return practiceExamPapers;
            }
            catch (InvalidOperationException ex)
            {
                throw new InvalidOperationException($"Lỗi thao tác database: {ex.Message}", ex);
            }
            catch (SqlException ex)
            {
                throw new InvalidOperationException($"Lỗi kết nối database: {ex.Message}", ex);
            }
            catch (TimeoutException ex)
            {
                throw new TimeoutException($"Timeout khi truy vấn database: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi không xác định khi lấy danh sách đề thi: {ex.Message}", ex);
            }
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
            try
            {
                // Validate input parameters
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 5;
                
                // Check for potential overflow
                if (page > int.MaxValue / pageSize)
                {
                    throw new ArgumentException("Page hoặc pageSize quá lớn, có thể gây overflow");
                }

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
                        CategoryExamName = x.CategoryExam == null ? "N/A" : x.CategoryExam.CategoryExamName,
                        SubjectName = x.Subject == null ? "N/A" : x.Subject.SubjectName,
                        SemesterName = x.Semester == null ? "N/A" : x.Semester.SemesterName
                    })
                     .ToListAsync();

                return items;
            }
            catch (ArgumentException ex)
            {
                // Re-throw argument exceptions
                throw;
            }
            catch (InvalidOperationException ex)
            {
                throw new InvalidOperationException($"Lỗi thao tác database: {ex.Message}", ex);
            }
            catch (SqlException ex)
            {
                throw new InvalidOperationException($"Lỗi kết nối database: {ex.Message}", ex);
            }
            catch (TimeoutException ex)
            {
                throw new TimeoutException($"Timeout khi truy vấn database: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi không xác định khi lấy danh sách đề thi: {ex.Message}", ex);
            }
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
            try
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
            catch (InvalidOperationException ex)
            {
                throw new InvalidOperationException($"Lỗi thao tác database khi đếm trang: {ex.Message}", ex);
            }
            catch (SqlException ex)
            {
                throw new InvalidOperationException($"Lỗi kết nối database khi đếm trang: {ex.Message}", ex);
            }
            catch (TimeoutException ex)
            {
                throw new TimeoutException($"Timeout khi đếm trang: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi không xác định khi đếm trang: {ex.Message}", ex);
            }
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
                    .Select(q => new LPracticeExamQuestionDetailDTO
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
