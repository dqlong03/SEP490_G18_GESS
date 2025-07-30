using Gess.Repository.Infrastructures;
using GESS.Common;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.MultiExamHistories;
using GESS.Model.MultipleExam;
using GESS.Model.NoQuestionInChapter;
using GESS.Model.Student;
using GESS.Model.Subject;
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



        //
        public async Task<MultipleExamUpdateDTO> GetMultipleExamForUpdateAsync(int multiExamId)
        {
            var exam = await _context.MultiExams
                .Include(e => e.NoQuestionInChapters)
                .Include(e => e.MultiExamHistories)
                .FirstOrDefaultAsync(e => e.MultiExamId == multiExamId);

            if (exam == null) return null;

            return new MultipleExamUpdateDTO
            {
                MultiExamId = exam.MultiExamId,
                MultiExamName = exam.MultiExamName,
                NumberQuestion = exam.NumberQuestion,
                Duration = exam.Duration,
                StartDay = exam.StartDay ?? DateTime.MinValue,
                EndDay = exam.EndDay ?? DateTime.MinValue,
                CreateAt = exam.CreateAt,
                TeacherId = exam.TeacherId,
                SubjectId = exam.SubjectId,
                ClassId = exam.ClassId,
                CategoryExamId = exam.CategoryExamId,
                SemesterId = exam.SemesterId,
                IsPublish = exam.IsPublish,
                NoQuestionInChapterDTO = exam.NoQuestionInChapters?.Select(n => new NoQuestionInChapterDTO
                {
                    NumberQuestion = n.NumberQuestion,
                    ChapterId = n.ChapterId,
                    LevelQuestionId = n.LevelQuestionId
                }).ToList(),
                StudentExamDTO = exam.MultiExamHistories?.Select(h => new StudentExamDTO
                {
                    StudentId = h.StudentId
                }).ToList()
            };
        }

        public async Task<bool> UpdateMultipleExamAsync(MultipleExamUpdateDTO dto)
        {
            var exam = await _context.MultiExams
                .Include(e => e.NoQuestionInChapters)
                .Include(e => e.MultiExamHistories)
                .FirstOrDefaultAsync(e => e.MultiExamId == dto.MultiExamId);

            if (exam == null) return false;

            // Update fields
            exam.MultiExamName = dto.MultiExamName;
            exam.NumberQuestion = dto.NumberQuestion;
            exam.Duration = dto.Duration;
            exam.StartDay = dto.StartDay;
            exam.EndDay = dto.EndDay;
            exam.CreateAt = dto.CreateAt;
            exam.TeacherId = dto.TeacherId;
            exam.SubjectId = dto.SubjectId;
            exam.ClassId = dto.ClassId;
            exam.CategoryExamId = dto.CategoryExamId;
            exam.SemesterId = dto.SemesterId;
            exam.IsPublish = dto.IsPublish;

            // Update NoQuestionInChapters
            _context.NoQuestionInChapters.RemoveRange(exam.NoQuestionInChapters);
            if (dto.NoQuestionInChapterDTO != null)
            {
                foreach (var n in dto.NoQuestionInChapterDTO)
                {
                    _context.NoQuestionInChapters.Add(new NoQuestionInChapter
                    {
                        MultiExamId = exam.MultiExamId,
                        ChapterId = n.ChapterId,
                        LevelQuestionId = n.LevelQuestionId,
                        NumberQuestion = n.NumberQuestion
                    });
                }
            }

            // Update StudentExamDTO (MultiExamHistories)
            _context.MultiExamHistories.RemoveRange(exam.MultiExamHistories);
            if (dto.StudentExamDTO != null)
            {
                foreach (var s in dto.StudentExamDTO)
                {
                    _context.MultiExamHistories.Add(new MultiExamHistory
                    {
                        MultiExamId = exam.MultiExamId,
                        StudentId = s.StudentId
                    });
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }





        public async Task<List<SubjectListDTO>> GetSubjectsByTeacherIdAsync(Guid teacherId)
        {
            var subjects = await _context.Classes
              .Where(c => c.TeacherId == teacherId)
              .Select(c => new SubjectListDTO
              {
                  SubjectId = c.Subject.SubjectId,
                  SubjectName = c.Subject.SubjectName
              })
              .Distinct()
              .ToListAsync();
            return subjects;
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

        // Helper: Validate khung thời gian cho kỳ thi giữa kỳ
        private async Task ValidateExamTimeFrame(MultiExam exam)
        {
            // Kiểm tra xem có phải kỳ thi giữa kỳ không
            bool isMidtermExam = IsMidtermExam(exam.CategoryExam.CategoryExamName);
            
            if (isMidtermExam)
            {
                DateTime currentTime = DateTime.Now;
                
                // Validate thời gian hiện tại có nằm trong khung thời gian cho phép không
                if (currentTime < exam.StartDay)
                {
                    throw new Exception($"Kỳ thi giữa kỳ chưa được mở. " +
                                      $"Thời gian bắt đầu: {exam.StartDay:dd/MM/yyyy HH:mm}. " +
                                      $"Thời gian hiện tại: {currentTime:dd/MM/yyyy HH:mm}.");
                }
                
                if (currentTime > exam.EndDay)
                {
                    throw new Exception($"Kỳ thi giữa kỳ đã hết hạn. " +
                                      $"Thời gian kết thúc: {exam.EndDay:dd/MM/yyyy HH:mm}. " +
                                      $"Thời gian hiện tại: {currentTime:dd/MM/yyyy HH:mm}.");
                }
                
                Console.WriteLine($"[DEBUG] Midterm exam time validation passed. " +
                                $"StartDay: {exam.StartDay:dd/MM/yyyy HH:mm}, " +
                                $"EndDay: {exam.EndDay:dd/MM/yyyy HH:mm}, " +
                                $"Current: {currentTime:dd/MM/yyyy HH:mm}");
            }
            else
            {
                Console.WriteLine($"[DEBUG] Not a midterm exam ({exam.CategoryExam.CategoryExamName}), skipping time frame validation.");
            }
        }

        // Helper: Kiểm tra có phải kỳ thi giữa kỳ không dựa vào tên danh mục
        private bool IsMidtermExam(string categoryExamName)
        {
            if (string.IsNullOrEmpty(categoryExamName))
                return false;
                
           
            return categoryExamName.Trim().Equals(PredefinedCategoryExam.MidTERM_EXAM_CATEGORY, StringComparison.OrdinalIgnoreCase);
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
                CodeStart = Guid.NewGuid().ToString().Substring(0, 5).ToUpper(),
                Status = Common.PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM,
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
                            StatusExam = PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM,
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

            // 3. VALIDATE KHUNG THỜI GIAN CHO KỲ THI GIỮA KỲ
            await ValidateExamTimeFrame(exam);

            // 4. Validate student is in the class for the exam
            var isStudentInClass = await _context.ClassStudents
                .AnyAsync(cs => cs.ClassId == exam.ClassId && cs.StudentId == studentId);

            if (!isStudentInClass)
            {
                throw new Exception("Bạn không thuộc lớp của bài thi này.");
            }

            // 5. Get exam history and check for attendance
            var history = await _context.MultiExamHistories
                .FirstOrDefaultAsync(h => h.MultiExamId == exam.MultiExamId && h.StudentId == studentId);

            if (history == null || !history.CheckIn)
            {
                throw new Exception("Bạn chưa được điểm danh.");
            }

            // 6. Phân tích trạng thái hiện tại và quyết định hành động
            string currentStatus = history.StatusExam?.Trim();
            bool isFirstTime = string.IsNullOrEmpty(currentStatus) || currentStatus == PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM;
            bool isCompleted = currentStatus == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM;
            bool isIncomplete = currentStatus == PredefinedStatusExamInHistoryOfStudent.INCOMPLETE_EXAM;
            bool isInProgress = currentStatus == PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM;

            // 7. Kiểm tra timeout cho TH3 & TH4
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

            // 8. Xử lý TH1 & TH2
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
            // 1. Kiểm tra timeout theo thời gian làm bài (Duration)
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

            // 2. Kiểm tra khung thời gian cho kỳ thi giữa kỳ (StartDay - EndDay)
            var midtermTimeoutExams = await _context.MultiExamHistories
                .Include(h => h.MultiExam)
                    .ThenInclude(m => m.CategoryExam)
                .Where(h => h.StatusExam == PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM &&
                           DateTime.Now > h.MultiExam.EndDay)
                .ToListAsync();

            foreach (var exam in midtermTimeoutExams)
            {
                // Chỉ xử lý nếu là kỳ thi giữa kỳ
                if (IsMidtermExam(exam.MultiExam.CategoryExam.CategoryExamName))
                {
                    await AutoMarkIncomplete(exam);
                    Console.WriteLine($"[DEBUG] Auto-marked midterm exam as incomplete due to time frame expiry. " +
                                    $"ExamId: {exam.MultiExam.MultiExamId}, EndDay: {exam.MultiExam.EndDay:dd/MM/yyyy HH:mm}");
                }
            }
            
            if (timeoutExams.Any() || midtermTimeoutExams.Any())
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

        // Helper: Tạo câu hỏi cho bài thi (Phân biệt giữa bài thi giữa kỳ và cuối kỳ)
        // - Bài thi giữa kỳ: Random câu hỏi từ question bank
        // - Bài thi cuối kỳ: Lấy câu hỏi từ bảng FinalExam
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

                // BƯỚC 2: Kiểm tra xem có phải bài thi cuối kỳ không (có dữ liệu trong bảng FinalExam)
                var finalExamQuestions = await _context.FinalExam
                    .Where(fe => fe.MultiExamId == exam.MultiExamId)
                    .Select(fe => fe.MultiQuestionId)
                    .ToListAsync();

                List<int> newQuestionIds = new List<int>();

                if (finalExamQuestions.Any())
                {
                    // Đây là bài thi cuối kỳ - lấy câu hỏi từ bảng FinalExam
                    Console.WriteLine($"[DEBUG] Final exam detected. Found {finalExamQuestions.Count} predefined questions in FinalExam table");
                    
                    // Kiểm tra số lượng câu hỏi có khớp với yêu cầu không
                    if (finalExamQuestions.Count != exam.NumberQuestion)
                    {
                        throw new Exception($"Số lượng câu hỏi trong bài thi cuối kỳ không khớp. " +
                                          $"Yêu cầu: {exam.NumberQuestion} câu, " +
                                          $"Có trong FinalExam: {finalExamQuestions.Count} câu.");
                    }
                    
                    // Kiểm tra xem các câu hỏi có tồn tại và có trạng thái phù hợp không
                    var validQuestions = await _context.MultiQuestions
                        .Where(q => finalExamQuestions.Contains(q.MultiQuestionId) && 
                                   q.IsActive == true)
                        .Select(q => q.MultiQuestionId)
                        .ToListAsync();
                    
                    if (validQuestions.Count != finalExamQuestions.Count)
                    {
                        throw new Exception($"Một số câu hỏi trong bài thi cuối kỳ không tồn tại hoặc không hoạt động. " +
                                          $"Cần: {finalExamQuestions.Count} câu, " +
                                          $"Hợp lệ: {validQuestions.Count} câu.");
                    }
                    
                    newQuestionIds = finalExamQuestions;
                    Console.WriteLine($"[DEBUG] Using {newQuestionIds.Count} predefined questions from FinalExam table");
                }
                else
                {
                    // Đây là bài thi giữa kỳ - random câu hỏi từ question bank
                    Console.WriteLine($"[DEBUG] Midterm exam detected. Generating random questions from question bank");
                    
                    var random = new Random();
                    var usedQuestionIds = new HashSet<int>();

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
                }
                
                // Kiểm tra tổng số câu hỏi có khớp với yêu cầu không (cho bài thi giữa kỳ)
                if (!finalExamQuestions.Any() && newQuestionIds.Count != exam.NumberQuestion)
                {
                    throw new Exception($"Số lượng câu hỏi được random cho bài thi giữa kỳ không khớp. " +
                                      $"Yêu cầu: {exam.NumberQuestion} câu, " +
                                      $"Đã random: {newQuestionIds.Count} câu.");
                }
                
                Console.WriteLine($"[DEBUG] Final question count validation: Required={exam.NumberQuestion}, Actual={newQuestionIds.Count}");
                
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
