using Gess.Repository.Infrastructures;
using GESS.Common;
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
                ExamDate = multipleExamCreateDto.ExamDate,
                CategoryExamId = multipleExamCreateDto.CategoryExamId,
                SemesterId = multipleExamCreateDto.SemesterId,
                TeacherId = multipleExamCreateDto.TeacherId,
                CreateAt = multipleExamCreateDto.CreateAt,
                IsPublish = multipleExamCreateDto.IsPublish,
                ClassId = multipleExamCreateDto.ClassId,
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

            if (exam.Status.ToLower().Trim() != PredefinedStatusAllExam.OPENING_EXAM.ToLower().Trim())
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

            // 5. Set StartTime when code verification is successful
            history.StartTime = DateTime.Now;
            history.StatusExam = PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM.Trim();
            
            // Save StartTime to database immediately
            await _context.SaveChangesAsync();

            string message = "Xác thực thành công. Bắt đầu thi.";

            // 6. Handle exam questions (re-take or first-take)
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

            // 7. Prepare and return response
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

            // Chỉ lưu câu trả lời, không tính điểm
            foreach (var ans in dto.Answers)
            {
                var questionExam = history.QuestionMultiExams.FirstOrDefault(q => q.MultiQuestionId == ans.QuestionId);
                if (questionExam == null) continue;
                
                // Chỉ cập nhật câu trả lời, giữ nguyên điểm = 0
                questionExam.Answer = ans.Answer ?? string.Empty;
                // Không cập nhật Score ở đây
            }
            
            // Không cập nhật history.Score ở đây
            await _context.SaveChangesAsync();
            
            return new UpdateMultiExamProgressResponseDTO
            {
                TotalScore = 0, // Không trả về điểm trong quá trình làm bài
                QuestionResults = new List<QuestionResultDTO>() // Không trả về kết quả chấm điểm
            };
        }

        public async Task<SubmitExamResponseDTO> SubmitExamAsync(UpdateMultiExamProgressDTO dto)
        {
            var history = await _context.MultiExamHistories
                .Include(h => h.QuestionMultiExams)
                    .ThenInclude(q => q.MultiQuestion)
                        .ThenInclude(mq => mq.LevelQuestion)
                .Include(h => h.MultiExam)
                    .ThenInclude(me => me.Subject)
                .FirstOrDefaultAsync(h => h.ExamHistoryId == dto.MultiExamHistoryId);

            if (history == null)
                throw new Exception("Không tìm thấy lịch sử bài thi.");

            if (history.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM.ToLower().Trim())
                throw new Exception("Bài thi đã được nộp, không thể nộp lại.");

            var questionResults = new List<QuestionResultDTO>();
            int correctAnswers = 0;
            double totalScore = 0;
            double maxPossibleScore = 0;
            int totalQuestions = history.QuestionMultiExams.Count;

            foreach (var questionExam in history.QuestionMultiExams)
            {
                var ans = dto.Answers.FirstOrDefault(a => a.QuestionId == questionExam.MultiQuestionId);
                string studentAnswer = ans?.Answer ?? string.Empty;

                // Lấy tất cả đáp án đúng của câu hỏi
                var correctAnswerIds = await _context.MultiAnswers
                    .Where(a => a.MultiQuestionId == questionExam.MultiQuestionId && a.IsCorrect)
                    .Select(a => a.AnswerId)
                    .ToListAsync();

                bool isCorrect = false;

                if (!string.IsNullOrEmpty(studentAnswer) && correctAnswerIds.Any())
                {
                    // Parse student answers (có thể là single ID hoặc multiple IDs cách nhau bằng dấu phẩy)
                    var studentAnswerIds = studentAnswer.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(id => int.TryParse(id.Trim(), out int answerId) ? answerId : 0)
                        .Where(id => id > 0)
                        .ToList();

                    if (studentAnswerIds.Any())
                    {
                        // Kiểm tra câu trả lời:
                        // - Số lượng đáp án đã chọn phải bằng số đáp án đúng
                        // - Tất cả đáp án đã chọn phải là đáp án đúng
                        isCorrect = studentAnswerIds.Count == correctAnswerIds.Count &&
                                   studentAnswerIds.All(id => correctAnswerIds.Contains(id));
                    }
                }

                double weight = questionExam.MultiQuestion.LevelQuestion.Score;
                double score = isCorrect ? weight : 0;

                // Cập nhật điểm và đáp án cho từng câu hỏi
                questionExam.Answer = studentAnswer;
                questionExam.Score = score;

                if (isCorrect) correctAnswers++;
                totalScore += score;
                maxPossibleScore += weight;

                questionResults.Add(new QuestionResultDTO
                {
                    QuestionId = questionExam.MultiQuestionId,
                    IsCorrect = isCorrect,
                    Score = score
                });
            }

            // Calculate final score on scale of 10 - SỬA Ở ĐÂY: làm tròn ngay khi tính
            double finalScore = maxPossibleScore > 0 ? Math.Round((totalScore / maxPossibleScore) * 10, 2) : 0;

            // Calculate correct answers percentage
            string correctAnswersPercentage = totalQuestions > 0
                ? $"{correctAnswers}/{totalQuestions} ({(double)correctAnswers / totalQuestions * 100:F0}%)"
                : "0/0 (0%)";

            // Update exam status
            history.Score = finalScore;
            history.StatusExam = PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM;
            history.EndTime = DateTime.Now;
            history.IsGrade = true;
            await _context.SaveChangesAsync();

            // Calculate time taken
            string timeTaken = "";
            if (history.StartTime.HasValue && history.EndTime.HasValue)
            {
                var duration = history.EndTime.Value - history.StartTime.Value;
                timeTaken = $"{duration.Hours:D2}:{duration.Minutes:D2}:{duration.Seconds:D2}";
            }

            return new SubmitExamResponseDTO
            {
                ExamName = history.MultiExam.MultiExamName,
                SubjectName = history.MultiExam.Subject.SubjectName,
                TimeTaken = timeTaken,
                CorrectAnswersPercentage = correctAnswersPercentage,
                FinalScore = finalScore, // Đã được làm tròn ở trên rồi, không cần Math.Round nữa
                QuestionResults = questionResults,
                CorrectCount = correctAnswers,
                TotalCount = totalQuestions
            };
        }


    }
    
    
}
