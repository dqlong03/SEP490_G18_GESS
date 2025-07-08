using Gess.Repository.Infrastructures;
using GESS.Common;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.MultiExamHistories;
using GESS.Model.MultipleExam;
using GESS.Model.NoQuestionInChapter;
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

        // Helper: Validate có đủ câu hỏi để tạo đề
        private async Task ValidateQuestionAvailability(ICollection<NoQuestionInChapterDTO> questionConfigs)
        {
            var usedQuestionIds = new HashSet<int>();
            
            foreach (var config in questionConfigs)
            {
                var availableQuestions = await _context.MultiQuestions
                    .Where(q => q.ChapterId == config.ChapterId &&
                                q.LevelQuestionId == config.LevelQuestionId &&
                                q.IsPublic == true &&
                                q.IsActive == true &&
                                !usedQuestionIds.Contains(q.MultiQuestionId))
                    .Select(q => q.MultiQuestionId)
                    .ToListAsync();

                if (availableQuestions.Count < config.NumberQuestion)
                {
                    throw new Exception($"Không đủ câu hỏi để tạo đề thi! " +
                                      $"Chapter {config.ChapterId} - Level {config.LevelQuestionId}: " +
                                      $"Cần {config.NumberQuestion} câu, chỉ có {availableQuestions.Count} câu khả dụng.");
                }

                // Mark questions as "used" for validation
                foreach (var questionId in availableQuestions.Take(config.NumberQuestion))
                {
                    usedQuestionIds.Add(questionId);
                }
            }
        }



        public async Task<MultiExam> CreateMultipleExamAsync(MultipleExamCreateDTO multipleExamCreateDto)
        {
            // Validate có đủ câu hỏi trước khi tạo đề
            await ValidateQuestionAvailability(multipleExamCreateDto.NoQuestionInChapterDTO);
            
            var multiExam = new MultiExam
            {
                MultiExamName = multipleExamCreateDto.MultiExamName,
                NumberQuestion = multipleExamCreateDto.NumberQuestion,
                SubjectId = multipleExamCreateDto.SubjectId,
                Duration = multipleExamCreateDto.Duration,
                StartDay = multipleExamCreateDto.StartDay,
                EndDay = multipleExamCreateDto.EndDay,
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
            // Kiểm tra và xử lý timeout trước tiên
            await CheckAndHandleTimeoutExams();

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

            // 5. Phân tích trạng thái hiện tại và quyết định hành động
            string currentStatus = history.StatusExam?.Trim();
            bool isFirstTime = string.IsNullOrEmpty(currentStatus) || currentStatus == PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM;
            bool isCompleted = currentStatus == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM;
            bool isIncomplete = currentStatus == PredefinedStatusExamInHistoryOfStudent.INCOMPLETE_EXAM;
            bool isInProgress = currentStatus == PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM;

            // 6. Kiểm tra timeout cho TH3 & TH4
            if (isInProgress && history.StartTime.HasValue)
            {
                var timeElapsed = DateTime.Now - history.StartTime.Value;
                var timeRemaining = exam.Duration - timeElapsed.TotalMinutes;
                
                if (timeRemaining <= 0)
                {
                    // TH4: Hết thời gian - tự động chuyển sang INCOMPLETE
                    return await HandleTimeoutCase(history);
                }
                
                // TH3: Còn thời gian, tiếp tục thi
                return await HandleContinueCase(history, timeRemaining, exam);
            }

            // 7. Xử lý TH1 & TH2
            if (isFirstTime)
            {
                return await HandleFirstTimeCase(history, exam);
            }
            else if (isCompleted || isIncomplete)
            {
                return await HandleRetakeCase(history, exam);
            }

            throw new Exception("Trạng thái bài thi không hợp lệ.");
        }

        // Helper method: Kiểm tra và xử lý timeout tự động
        private async Task CheckAndHandleTimeoutExams()
        {
            var timeoutExams = await _context.MultiExamHistories
                .Include(h => h.MultiExam)
                .Where(h => h.StatusExam == PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM && 
                           h.StartTime.HasValue &&
                           DateTime.Now > h.StartTime.Value.AddMinutes(h.MultiExam.Duration))
                .ToListAsync();
                
            foreach (var exam in timeoutExams)
            {
                await AutoMarkIncomplete(exam);
            }
            
            if (timeoutExams.Any())
            {
                await _context.SaveChangesAsync();
            }
            
        }

        // TH1: Lần đầu làm bài
        private async Task<ExamInfoResponseDTO> HandleFirstTimeCase(MultiExamHistory history, MultiExam exam)
        {
            // Set StartTime và StatusExam
            history.StartTime = DateTime.Now;
            history.StatusExam = PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM;
            
            // Lưu thay đổi history trước
            await _context.SaveChangesAsync();
            
            // Tạo câu hỏi mới (random) - GenerateRandomQuestions sẽ tự xóa câu cũ nếu có
            var questions = await GenerateRandomQuestions(exam, history.ExamHistoryId);
            
            var studentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == history.StudentId);
            
            return new ExamInfoResponseDTO
            {
                MultiExamHistoryId = history.ExamHistoryId,
                StudentFullName = studentUser?.Fullname,
                StudentCode = studentUser?.Code,
                SubjectName = exam.Subject.SubjectName,
                ExamCategoryName = exam.CategoryExam.CategoryExamName,
                Duration = exam.Duration,
                StartTime = history.StartTime,
                Message = "Xác thực thành công. Bắt đầu thi.",
                Questions = questions
            };
        }

        // TH2: Thi lại (từ COMPLETED hoặc INCOMPLETE)
        private async Task<ExamInfoResponseDTO> HandleRetakeCase(MultiExamHistory history, MultiExam exam)
        {
            // Reset StartTime (hợp lý - vì là lần thi mới)
            history.StartTime = DateTime.Now;
            history.StatusExam = PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM;
            history.Score = 0;
            history.IsGrade = false;
            history.EndTime = null;
            
            // Lưu thay đổi history trước
            await _context.SaveChangesAsync();
            
            // Random câu hỏi mới hoàn toàn (GenerateRandomQuestions sẽ tự xóa câu cũ)
            var newQuestions = await GenerateRandomQuestions(exam, history.ExamHistoryId);
            
            var studentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == history.StudentId);
            
            return new ExamInfoResponseDTO
            {
                MultiExamHistoryId = history.ExamHistoryId,
                StudentFullName = studentUser?.Fullname,
                StudentCode = studentUser?.Code,
                SubjectName = exam.Subject.SubjectName,
                ExamCategoryName = exam.CategoryExam.CategoryExamName,
                Duration = exam.Duration,
                StartTime = history.StartTime,
                Message = "Xác thực thành công. Bắt đầu thi lại.",
                Questions = newQuestions
            };
        }

        // TH3: Tiếp tục thi (máy sập, vào lại)
        private async Task<ExamInfoResponseDTO> HandleContinueCase(MultiExamHistory history, double timeRemaining, MultiExam exam)
        {
            // KHÔNG thay đổi StartTime - thời gian tiếp tục chạy
            // KHÔNG random lại câu hỏi
            // KHÔNG reset đáp án

            var existingQuestions = await _context.QuestionMultiExams
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

            // THÊM: Load đáp án đã lưu
            var savedAnswers = await _context.QuestionMultiExams
                .Where(q => q.MultiExamHistoryId == history.ExamHistoryId)
                .Where(q => !string.IsNullOrEmpty(q.Answer)) // Chỉ lấy câu đã có đáp án
                .Select(q => new SavedAnswerDTO
                {
                    QuestionId = q.MultiQuestionId,
                    Answer = q.Answer
                })
                .ToListAsync();

            var studentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == history.StudentId);

            return new ExamInfoResponseDTO
            {
                MultiExamHistoryId = history.ExamHistoryId,
                StudentFullName = studentUser?.Fullname,
                StudentCode = studentUser?.Code,
                SubjectName = exam.Subject.SubjectName,
                ExamCategoryName = exam.CategoryExam.CategoryExamName,
                Duration = exam.Duration,
                StartTime = history.StartTime, // QUAN TRỌNG: Trả về StartTime
                Message = "Xác thực thành công. Tiếp tục bài thi.",
                Questions = existingQuestions,
                SavedAnswers = savedAnswers // QUAN TRỌNG: Trả về đáp án đã lưu
            };
        }

        // TH4: Hết thời gian - tự động chuyển sang INCOMPLETE
        private async Task<ExamInfoResponseDTO> HandleTimeoutCase(MultiExamHistory history)
        {
            await AutoMarkIncomplete(history);
            await _context.SaveChangesAsync();
            
            throw new Exception($"Bài thi đã hết thời gian và được tự động chuyển sang trạng thái: {PredefinedStatusExamInHistoryOfStudent.INCOMPLETE_EXAM}. Điểm số: {history.Score}");
        }

        // Helper: Random câu hỏi mới cho TH1 & TH2 (Clean approach - tránh gaps trong QuestionOrder)
        private async Task<List<MultiQuestionDetailDTO>> GenerateRandomQuestions(MultiExam exam, Guid examHistoryId)
        {
            try
            {
                Console.WriteLine($"[DEBUG] GenerateRandomQuestions - START for ExamHistoryId: {examHistoryId}");
                
                // BƯỚC 1: XÓA TẤT CẢ câu hỏi cũ trước (Clean slate approach)
                var existingQuestions = await _context.QuestionMultiExams
                    .Where(q => q.MultiExamHistoryId == examHistoryId)
                    .ToListAsync();
                
                Console.WriteLine($"[DEBUG] Found {existingQuestions.Count} existing questions to remove");
                
                if (existingQuestions.Any())
                {
                    _context.QuestionMultiExams.RemoveRange(existingQuestions);
                    await _context.SaveChangesAsync(); // Lưu việc xóa trước
                    Console.WriteLine($"[DEBUG] Removed all {existingQuestions.Count} existing questions");
                }

                // BƯỚC 2: Random tạo bộ đề mới hoàn toàn
                var random = new Random();
                var usedQuestionIds = new HashSet<int>();
                var newQuestionIds = new List<int>();

                Console.WriteLine($"[DEBUG] Processing {exam.NoQuestionInChapters.Count} chapters...");

                foreach (var chapterConfig in exam.NoQuestionInChapters)
                {
                    Console.WriteLine($"[DEBUG] Chapter {chapterConfig.ChapterId}, Level {chapterConfig.LevelQuestionId}, Need {chapterConfig.NumberQuestion} questions");

                    var availableQuestions = await _context.MultiQuestions
                        .Where(q => q.ChapterId == chapterConfig.ChapterId &&
                                    q.LevelQuestionId == chapterConfig.LevelQuestionId &&
                                    q.IsPublic == true &&
                                    q.IsActive == true &&
                                    !usedQuestionIds.Contains(q.MultiQuestionId))
                        .Select(q => q.MultiQuestionId)
                        .ToListAsync();

                    Console.WriteLine($"[DEBUG] Available questions for Chapter {chapterConfig.ChapterId}: {availableQuestions.Count} questions");

                    if (availableQuestions.Count < chapterConfig.NumberQuestion)
                    {
                        throw new Exception($"Không đủ câu hỏi cho chương {chapterConfig.ChapterId}. " +
                                          $"Cần {chapterConfig.NumberQuestion} câu, chỉ có {availableQuestions.Count} câu khả dụng.");
                    }

                    var selectedQuestionIds = availableQuestions
                        .OrderBy(id => random.Next())
                        .Take(chapterConfig.NumberQuestion);

                    Console.WriteLine($"[DEBUG] Selected questions for Chapter {chapterConfig.ChapterId}: [{string.Join(", ", selectedQuestionIds)}]");

                    foreach (var questionId in selectedQuestionIds)
                    {
                        if (!usedQuestionIds.Contains(questionId))
                        {
                            usedQuestionIds.Add(questionId);
                            newQuestionIds.Add(questionId);
                        }
                    }
                }
                
                Console.WriteLine($"[DEBUG] Total new question IDs: [{string.Join(", ", newQuestionIds)}]");

                // BƯỚC 3: Tạo tất cả câu hỏi mới với QuestionOrder liên tục (1, 2, 3, ...)
                var questionsToAdd = new List<QuestionMultiExam>();
                
                for (int i = 0; i < newQuestionIds.Count; i++)
                {
                    var questionId = newQuestionIds[i];
                    var newOrder = i + 1; // Đảm bảo QuestionOrder liên tục: 1, 2, 3, 4, 5...
                    
                    questionsToAdd.Add(new QuestionMultiExam
                    {
                        MultiExamHistoryId = examHistoryId,
                        MultiQuestionId = questionId,
                        QuestionOrder = newOrder,
                        Score = 0,
                        Answer = ""
                    });
                }
                
                Console.WriteLine($"[DEBUG] Creating {questionsToAdd.Count} new questions with orders: [{string.Join(", ", questionsToAdd.Select(q => q.QuestionOrder))}]");

                // BƯỚC 4: Thêm tất cả câu hỏi mới
                if (questionsToAdd.Any())
                {
                    await _context.QuestionMultiExams.AddRangeAsync(questionsToAdd);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"[DEBUG] Successfully added {questionsToAdd.Count} new questions");
                }

                // BƯỚC 5: Verify và trả về kết quả
                var result = await _context.QuestionMultiExams
                    .Include(q => q.MultiQuestion)
                    .Where(q => q.MultiExamHistoryId == examHistoryId)
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
                
                // Verify QuestionOrder liên tục
                var actualOrders = await _context.QuestionMultiExams
                    .Where(q => q.MultiExamHistoryId == examHistoryId)
                    .OrderBy(q => q.QuestionOrder)
                    .Select(q => q.QuestionOrder)
                    .ToListAsync();
                    
                Console.WriteLine($"[DEBUG] Final QuestionOrders: [{string.Join(", ", actualOrders)}]");
                Console.WriteLine($"[DEBUG] GenerateRandomQuestions - END. Returning {result.Count} questions");
                
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GenerateRandomQuestions failed: {ex.Message}");
                Console.WriteLine($"[ERROR] Stack trace: {ex.StackTrace}");
                throw new Exception($"Lỗi khi tạo câu hỏi: {ex.Message}", ex);
            }
        }

        // Helper: Tự động đánh dấu bài thi không hoàn thành
        private async Task AutoMarkIncomplete(MultiExamHistory history)
        {
            // Tính điểm từ đáp án đã lưu
            var questions = await _context.QuestionMultiExams
                .Include(q => q.MultiQuestion)
                .ThenInclude(mq => mq.LevelQuestion)
                .Where(q => q.MultiExamHistoryId == history.ExamHistoryId)
                .ToListAsync();
            
            double totalScore = 0;
            double maxScore = 0;
            
            foreach (var question in questions)
            {
                if (!string.IsNullOrEmpty(question.Answer))
                {
                    // Tính điểm cho câu đã trả lời
                    bool isCorrect = await CheckAnswerCorrectness(question);
                    double score = isCorrect ? question.MultiQuestion.LevelQuestion.Score : 0;
                    question.Score = score;
                    totalScore += score;
                }
                maxScore += question.MultiQuestion.LevelQuestion.Score;
            }
            
            // Cập nhật trạng thái
            history.Score = maxScore > 0 ? Math.Round((totalScore / maxScore) * 10, 2) : 0;
            history.StatusExam = PredefinedStatusExamInHistoryOfStudent.INCOMPLETE_EXAM;
            history.EndTime = DateTime.Now;
            history.IsGrade = true;
        }

        // Helper: Kiểm tra tính đúng đắn của câu trả lời
        private async Task<bool> CheckAnswerCorrectness(QuestionMultiExam questionExam)
        {
            var correctAnswerIds = await _context.MultiAnswers
                .Where(a => a.MultiQuestionId == questionExam.MultiQuestionId && a.IsCorrect)
                .Select(a => a.AnswerId)
                .ToListAsync();

            if (!correctAnswerIds.Any() || string.IsNullOrEmpty(questionExam.Answer))
                return false;

            var studentAnswerIds = questionExam.Answer.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(id => int.TryParse(id.Trim(), out int answerId) ? answerId : 0)
                .Where(id => id > 0)
                .ToList();

            if (!studentAnswerIds.Any())
                return false;

            // Kiểm tra: số lượng đáp án đúng = số đáp án chọn và tất cả đều đúng
            return studentAnswerIds.Count == correctAnswerIds.Count &&
                   studentAnswerIds.All(id => correctAnswerIds.Contains(id));
        }

        public async Task<UpdateMultiExamProgressResponseDTO> UpdateProgressAsync(UpdateMultiExamProgressDTO dto)
        {
            // Kiểm tra timeout trước khi update
            await CheckAndHandleTimeoutExams();
            
            var history = await _context.MultiExamHistories
                .Include(h => h.QuestionMultiExams)
                .Include(h => h.MultiExam)
                .FirstOrDefaultAsync(h => h.ExamHistoryId == dto.MultiExamHistoryId);
                
            if (history == null) throw new Exception("Không tìm thấy lịch sử bài thi.");

            // Kiểm tra trạng thái bài thi có còn IN_PROGRESS không
            if (history.StatusExam?.Trim() != PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM)
            {
                throw new Exception($"Bài thi đã kết thúc với trạng thái: {history.StatusExam}");
            }

            // Kiểm tra timeout cho bài thi cụ thể này
            if (history.StartTime.HasValue)
            {
                var timeElapsed = DateTime.Now - history.StartTime.Value;
                var timeRemaining = history.MultiExam.Duration - timeElapsed.TotalMinutes;
                
                if (timeRemaining <= 0)
                {
                    // Bài thi đã hết thời gian, tự động chuyển sang INCOMPLETE
                    await AutoMarkIncomplete(history);
                    await _context.SaveChangesAsync();
                    throw new Exception("Bài thi đã hết thời gian và được tự động kết thúc.");
                }
            }

            // Auto-save câu trả lời (không tính điểm)
            foreach (var ans in dto.Answers)
            {
                var questionExam = history.QuestionMultiExams.FirstOrDefault(q => q.MultiQuestionId == ans.QuestionId);
                if (questionExam == null) continue;
                
                // Chỉ cập nhật câu trả lời, giữ nguyên điểm = 0
                questionExam.Answer = ans.Answer ?? string.Empty;
                // Không cập nhật Score ở đây
            }
            
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
