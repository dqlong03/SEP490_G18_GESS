using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.MultiExamHistories;
using GESS.Model.MultipleExam;
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
    public class MultipleExamRepository : BaseRepository<MultiExam>, IMultipleExamRepository
    {
        private readonly GessDbContext _context;
        public MultipleExamRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<MultiExam> CreateMultipleExamAsync(MultipleExamCreateDTO multipleExamCreateDto)
        {
            var multiExam = new MultiExam
            {
                MultiExamName = multipleExamCreateDto.MultiExamName,
                NumberQuestion = multipleExamCreateDto.NumberQuestion,
                SubjectId = multipleExamCreateDto.SubjectId,
                Duration = multipleExamCreateDto.Duration,
                CategoryExamId = multipleExamCreateDto.CategoryExamId,
                SemesterId = multipleExamCreateDto.SemesterId,
                TeacherId = multipleExamCreateDto.TeacherId,
                CreateAt = multipleExamCreateDto.CreateAt,
                IsPublish = multipleExamCreateDto.IsPublish,
            };
            
            try
            {
                await _context.MultiExams.AddAsync(multiExam);
                await _context.SaveChangesAsync();
                foreach (var noQuestion in multipleExamCreateDto.NoQuestionInChapterDTO)
                {
                    multiExam.NoQuestionInChapters.Add(new NoQuestionInChapter
                    {
                        ChapterId = noQuestion.ChapterId,
                        NumberQuestion = noQuestion.NumberQuestion,
                        LevelQuestionId = noQuestion.LevelQuestionId,
                    });
                }
                await _context.SaveChangesAsync();
                foreach (var student in multipleExamCreateDto.StudentExamDTO)
                {
                    var checkExistStudent = await _context.Students
                        .FirstOrDefaultAsync(s => s.StudentId == student.StudentId);
                    if (checkExistStudent != null)
                    {
                        var multiExamHistory = new MultiExamHistory
                        {
                            MultiExamId = multiExam.MultiExamId,
                            StudentId = student.StudentId,
                            IsGrade = false,
                            CheckIn = false,
                        };
                        await _context.MultiExamHistories.AddAsync(multiExamHistory);
                        await _context.SaveChangesAsync();
                    }
                }
                return multiExam;
            }
            catch (Exception ex)
            {
                throw new Exception("Error creating multiple exam: " + ex.Message);
            }
        }
        public async Task<ExamInfoResponseDTO> CheckAndPrepareExamAsync(int examId, string code, Guid studentId)
        {
            // 1. Find exam by id
            var exam = await _context.MultiExams
                .Include(m => m.Class)
                .Include(m => m.Subject)
                .Include(m => m.CategoryExam)
                .Include(m => m.NoQuestionInChapters)
                .SingleOrDefaultAsync(m => m.MultiExamId == examId);

            if (exam == null)
            {
                throw new Exception("Tên bài thi không đúng.");
            }

            // 2. Validate Code and Status
            if (exam.CodeStart != code)
            {
                throw new Exception("Mã thi không đúng.");
            }

            if (exam.Status != "Published")
            {
                throw new Exception("Bài thi chưa được mở.");
            }

            // 3. Validate student is in the class for the exam
            var isStudentInClass = await _context.ClassStudents
                .AnyAsync(cs => cs.ClassId == exam.ClassId && cs.StudentId == studentId);

            if (!isStudentInClass)
            {
                throw new Exception("Bạn không thuộc lớp của bài thi này.");
            }

            // 4. Get exam history and check for attendance
            var history = await _context.MultiExamHistories
                .FirstOrDefaultAsync(h => h.MultiExamId == exam.MultiExamId && h.StudentId == studentId);

            if (history == null || !history.CheckIn)
            {
                throw new Exception("Bạn chưa được điểm danh.");
            }

            string message = "Xác thực thành công. Bắt đầu thi.";

            // 5. Handle exam questions (re-take or first-take)
            var existingQuestions = await _context.QuestionMultiExams
                .Include(q => q.MultiQuestion)
                .Where(q => q.MultiExamHistoryId == history.ExamHistoryId)
                .ToListAsync();

            var existingQuestionIds = existingQuestions.Select(q => q.MultiQuestionId).ToHashSet();
            var newQuestions = new List<QuestionMultiExam>();
            int questionOrder = existingQuestions.Count + 1;
            var random = new Random();

            if (existingQuestions.Any())
            {
                // Reset answer and score for existing questions
                foreach (var question in existingQuestions)
                {
                    question.Answer = "";
                    question.Score = 0;
                }
                _context.QuestionMultiExams.UpdateRange(existingQuestions);
                message = "Xác thực thành công. Bắt đầu thi lại.";
                await _context.SaveChangesAsync();
            }
            else
            {
                // First-take scenario: generate new questions
                newQuestions = new List<QuestionMultiExam>();
                int firstOrder = 1;

                foreach (var chapterConfig in exam.NoQuestionInChapters)
                {
                    var availableQuestions = await _context.MultiQuestions
                        .Where(q => q.ChapterId == chapterConfig.ChapterId &&
                                    q.LevelQuestionId == chapterConfig.LevelQuestionId &&
                                    q.IsPublic == true &&
                                    q.IsActive == true)
                        .Select(q => q.MultiQuestionId)
                        .ToListAsync();

                    var selectedQuestionIds = availableQuestions
                        .OrderBy(id => random.Next())
                        .Take(chapterConfig.NumberQuestion);

                    foreach (var questionId in selectedQuestionIds)
                    {
                        newQuestions.Add(new QuestionMultiExam
                        {
                            MultiExamHistoryId = history.ExamHistoryId,
                            MultiQuestionId = questionId,
                            QuestionOrder = firstOrder++,
                            Score = 0,
                            Answer = ""
                        });
                    }
                }
                // Insert all generated questions into the database
                await _context.QuestionMultiExams.AddRangeAsync(newQuestions);
                await _context.SaveChangesAsync();
            }

            await _context.SaveChangesAsync();

            var studentUser = await _context.Users.FindAsync(studentId);

            // Prepare list of questions (id, QuestionOrder)
            var questionList = await _context.QuestionMultiExams
                .Include(q => q.MultiQuestion)
                .Where(q => q.MultiExamHistoryId == history.ExamHistoryId)
                .OrderBy(q => q.QuestionOrder)
                .Select(q => new MultiQuestionDetailDTO
                {
                    MultiQuestionId = q.MultiQuestionId,
                    Content = q.MultiQuestion.Content,
                    UrlImg = q.MultiQuestion.UrlImg,
                    ChapterId = q.MultiQuestion.ChapterId,
                    LevelQuestionId = q.MultiQuestion.LevelQuestionId
                })
                .ToListAsync();

            // 6. Prepare and return response
            return new ExamInfoResponseDTO
            {
                MultiExamHistoryId = history.ExamHistoryId,
                StudentFullName = studentUser?.Fullname,
                StudentCode = studentUser?.Code,
                SubjectName = exam.Subject.SubjectName,
                ExamCategoryName = exam.CategoryExam.CategoryExamName,
                Duration = exam.Duration,
                Message = message,
                Questions = questionList
            };
        }


        public async Task<UpdateMultiExamProgressResponseDTO> UpdateProgressAsync(UpdateMultiExamProgressDTO dto)
        {
            var history = await _context.MultiExamHistories
                .Include(h => h.QuestionMultiExams)
                .FirstOrDefaultAsync(h => h.ExamHistoryId == dto.MultiExamHistoryId);
            if (history == null) throw new Exception("Không tìm thấy lịch sử bài thi.");

            double totalScore = 0;
            var questionResults = new List<QuestionResultDTO>();

            foreach (var ans in dto.Answers)
            {
                var questionExam = history.QuestionMultiExams.FirstOrDefault(q => q.MultiQuestionId == ans.QuestionId);
                if (questionExam == null) continue;
                questionExam.Answer = ans.Answer ?? string.Empty;

                // Lấy đáp án đúng
                var correctAnswer = await _context.MultiAnswers
                    .Where(a => a.MultiQuestionId == ans.QuestionId && a.IsCorrect)
                    .Select(a => a.AnswerContent)
                    .FirstOrDefaultAsync();

                // Lấy điểm theo level (mặc định 1 điểm/câu nếu chưa có trường Score)
                bool isCorrect = !string.IsNullOrEmpty(correctAnswer) && string.Equals(ans.Answer, correctAnswer, StringComparison.OrdinalIgnoreCase);
                double score = isCorrect ? 1 : 0;
                questionExam.Score = score;
                totalScore += score;
                questionResults.Add(new QuestionResultDTO
                {
                    QuestionId = ans.QuestionId,
                    IsCorrect = isCorrect,
                    Score = score
                });
            }
            history.Score = totalScore;
            await _context.SaveChangesAsync();
            return new UpdateMultiExamProgressResponseDTO
            {
                TotalScore = totalScore,
                QuestionResults = questionResults
            };
        }

        public async Task<UpdateMultiExamProgressResponseDTO> SubmitExamAsync(UpdateMultiExamProgressDTO dto)
        {
            var history = await _context.MultiExamHistories
                .Include(h => h.QuestionMultiExams)
                .FirstOrDefaultAsync(h => h.ExamHistoryId == dto.MultiExamHistoryId);
            if (history == null)
                throw new Exception("Không tìm thấy lịch sử bài thi.");

            if (history.StatusExam == "Completed")
                throw new Exception("Bài thi đã được nộp, không thể nộp lại.");

            double totalScore = 0;
            var questionResults = new List<QuestionResultDTO>();

            foreach (var ans in dto.Answers)
            {
                var questionExam = history.QuestionMultiExams.FirstOrDefault(q => q.MultiQuestionId == ans.QuestionId);
                if (questionExam == null) continue;
                questionExam.Answer = ans.Answer ?? string.Empty;

                // Lấy đáp án đúng
                var correctAnswer = await _context.MultiAnswers
                    .Where(a => a.MultiQuestionId == ans.QuestionId && a.IsCorrect)
                    .Select(a => a.AnswerContent)
                    .FirstOrDefaultAsync();

                bool isCorrect = !string.IsNullOrEmpty(correctAnswer) && string.Equals(ans.Answer, correctAnswer, StringComparison.OrdinalIgnoreCase);
                double score = isCorrect ? 1 : 0;
                questionExam.Score = score;
                totalScore += score;
                questionResults.Add(new QuestionResultDTO
                {
                    QuestionId = ans.QuestionId,
                    IsCorrect = isCorrect,
                    Score = score
                });
            }
            // Cập nhật trạng thái nộp bài
            history.Score = totalScore;
            history.StatusExam = "Completed";
            history.EndTime = DateTime.Now;
            history.IsGrade = true;
            await _context.SaveChangesAsync();

            return new UpdateMultiExamProgressResponseDTO
            {
                TotalScore = totalScore,
                QuestionResults = questionResults
            };
        }
    }
    
    
}
