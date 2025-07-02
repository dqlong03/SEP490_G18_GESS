using Gess.Repository.Infrastructures;
using GESS.Common;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.MultiExamHistories;
using GESS.Model.MultipleExam;
using GESS.Model.PracticeExam;
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
    public class PracticeExamRepository : BaseRepository<PracticeExam>, IPracticeExamRepository
    {
        private readonly GessDbContext _context;
        public PracticeExamRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<PracticeExam> CreatePracticeExamAsync(PracticeExamCreateDTO practiceExamCreateDto)
        {
            var practiceExam = new PracticeExam
            {
                PracExamName = practiceExamCreateDto.PracExamName,
                Duration = practiceExamCreateDto.Duration,
                ExamDate = practiceExamCreateDto.ExamDate,
                TeacherId = practiceExamCreateDto.TeacherId,
                SubjectId = practiceExamCreateDto.SubjectId,
                CreateAt = practiceExamCreateDto.CreateAt,
                CategoryExamId = practiceExamCreateDto.CategoryExamId,
                SemesterId = practiceExamCreateDto.SemesterId,
                ClassId = practiceExamCreateDto.ClassId,
                Status = practiceExamCreateDto.Status,
            };
            try
            {
                await _context.PracticeExams.AddAsync(practiceExam);
                await _context.SaveChangesAsync();
                foreach (var paper in practiceExamCreateDto.PracticeExamPaperDTO)
                {
                    var noPEPaperInPE = new NoPEPaperInPE
                    {
                        PracExamId = practiceExam.PracExamId,
                        PracExamPaperId = paper.PracExamPaperId,
                       
                    };
                    await _context.NoPEPaperInPEs.AddAsync(noPEPaperInPE);
                }
                foreach (var studentId in practiceExamCreateDto.StudentIds)
                {
                    var practiceExamHistory = new PracticeExamHistory
                    {
                        PracExamId = practiceExam.PracExamId,
                        StudentId = studentId,
                        CheckIn = false,
                        IsGraded = false
                    };
                    await _context.PracticeExamHistories.AddAsync(practiceExamHistory);
                }

                await _context.SaveChangesAsync();
                return practiceExam;
            }
            catch (Exception ex)
            {
               return null; // or handle the exception as needed
            }
        }
        public async Task<PracticeExamInfoResponseDTO> CheckExamNameAndCodePEAsync(CheckPracticeExamRequestDTO request)
        {
            // 1. Tìm bài thi
            var exam = await _context.PracticeExams
                .Include(e => e.Subject)
                .Include(e => e.CategoryExam)
                .Include(e => e.NoPEPaperInPEs)
                .ThenInclude(n => n.PracticeExamPaper)
                .FirstOrDefaultAsync(e => e.PracExamId == request.ExamId && e.CodeStart == request.Code);

            if (exam == null)
                throw new Exception("Tên bài thi hoặc mã thi không đúng.");

            if (exam.Status.ToLower().Trim() != PredefinedStatusAllExam.OPENING_EXAM.ToLower().Trim())
                throw new Exception("Bài thi chưa được mở.");

            // 2. Lấy danh sách sinh viên và validate
            List<Guid> studentIds;
            if (exam.ClassId != 0) // Giữa kỳ
            {
                studentIds = await _context.ClassStudents
                    .Where(cs => cs.ClassId == exam.ClassId)
                    .OrderBy(cs => cs.StudentId)
                    .Select(cs => cs.StudentId)
                    .ToListAsync();
            }
            else // Cuối kỳ
            {
                var examSlotRoomId = exam.ExamSlotRoom?.ExamSlotRoomId;
                studentIds = await _context.PracticeExamHistories
                    .Where(h => h.ExamSlotRoomId == examSlotRoomId && h.PracExamId == exam.PracExamId)
                    .OrderBy(h => h.StudentId)
                    .Select(h => h.StudentId)
                    .ToListAsync();
            }

            // 3. Xác định STT sinh viên
            int stt = studentIds.IndexOf(request.StudentId) + 1;
            if (stt == 0)
                throw new Exception("Sinh viên không thuộc danh sách dự thi.");

            // 4. Lấy danh sách đề thi và chia đề
            var examPapers = exam.NoPEPaperInPEs.Select(n => n.PracExamPaperId).ToList();
            if (examPapers.Count == 0)
                throw new Exception("Chưa có đề thi cho bài thi này.");

            int paperIndex = (stt - 1) % examPapers.Count;
            int assignedPaperId = examPapers[paperIndex];

            // 5. Lấy exam history và phân tích trạng thái
            var history = await _context.PracticeExamHistories
                .FirstOrDefaultAsync(h => h.PracExamId == exam.PracExamId && h.StudentId == request.StudentId);

            if (history == null)
            {
                // TH1: Lần đầu vào thi - tạo history mới
                return await HandleFirstTimePracticeCase(exam, request.StudentId, assignedPaperId);
            }

            // 6. Phân tích trạng thái hiện tại và quyết định hành động
            string currentStatus = history.StatusExam?.Trim();
            bool isFirstTime = string.IsNullOrEmpty(currentStatus) || currentStatus == PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM;
            bool isCompleted = currentStatus == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM;
            bool isIncomplete = currentStatus == PredefinedStatusExamInHistoryOfStudent.INCOMPLETE_EXAM;
            bool isInProgress = currentStatus == PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM;

            if (isFirstTime)
            {
                // TH1: Lần đầu làm bài
                return await HandleFirstTimePracticeCase(history, exam, assignedPaperId);
            }
            else if (isCompleted || isIncomplete)
            {
                // TH2: Thi lại (từ COMPLETED hoặc INCOMPLETE)
                return await HandleRetakePracticeCase(history, exam, assignedPaperId);
            }
            else if (isInProgress)
            {
                // TH3: Tiếp tục thi (máy sập, vào lại)
                return await HandleContinuePracticeCase(history, exam);
            }

            throw new Exception("Trạng thái bài thi không hợp lệ.");
        }

        // TH1: Lần đầu làm bài (new history)
        private async Task<PracticeExamInfoResponseDTO> HandleFirstTimePracticeCase(PracticeExam exam, Guid studentId, int assignedPaperId)
        {
            var history = new PracticeExamHistory
            {
                PracExamHistoryId = Guid.NewGuid(),
                PracExamId = exam.PracExamId,
                StudentId = studentId,
                PracExamPaperId = assignedPaperId,
                StartTime = DateTime.Now,
                CheckIn = true,
                IsGraded = false,
                StatusExam = PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM,
            };

            await _context.PracticeExamHistories.AddAsync(history);
            await _context.SaveChangesAsync();

            // Tạo câu hỏi cho bài thi
            await GeneratePracticeQuestions(history.PracExamHistoryId, assignedPaperId);

            return await CreatePracticeExamResponse(history, exam, "Xác thực thành công. Bắt đầu thi.");
        }

        // TH1: Lần đầu làm bài (existing history chưa bắt đầu)
        private async Task<PracticeExamInfoResponseDTO> HandleFirstTimePracticeCase(PracticeExamHistory history, PracticeExam exam, int assignedPaperId)
        {
            // Set StartTime và StatusExam
            history.StartTime = DateTime.Now;
            history.StatusExam = PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM;
            history.PracExamPaperId = assignedPaperId;
            history.CheckIn = true;

            // Lưu thay đổi history trước
            await _context.SaveChangesAsync();

            // Tạo câu hỏi mới - xóa câu cũ nếu có
            await GeneratePracticeQuestions(history.PracExamHistoryId, assignedPaperId);

            return await CreatePracticeExamResponse(history, exam, "Xác thực thành công. Bắt đầu thi.");
        }

        // TH2: Thi lại (từ COMPLETED hoặc INCOMPLETE)
        private async Task<PracticeExamInfoResponseDTO> HandleRetakePracticeCase(PracticeExamHistory history, PracticeExam exam, int assignedPaperId)
        {
            // Reset StartTime và các thông tin liên quan
            history.StartTime = DateTime.Now;
            history.StatusExam = PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM;
            history.Score = 0;
            history.IsGraded = false;
            history.EndTime = null;
            history.PracExamPaperId = assignedPaperId; // Có thể được gán đề mới
            history.CheckIn = true;

            // Lưu thay đổi history trước
            await _context.SaveChangesAsync();

            // Tạo lại câu hỏi hoàn toàn mới (xóa câu cũ)
            await GeneratePracticeQuestions(history.PracExamHistoryId, assignedPaperId);

            return await CreatePracticeExamResponse(history, exam, "Xác thực thành công. Bắt đầu thi lại.");
        }

        // TH3: Tiếp tục thi (máy sập, vào lại)
        private async Task<PracticeExamInfoResponseDTO> HandleContinuePracticeCase(PracticeExamHistory history, PracticeExam exam)
        {
            // KHÔNG thay đổi StartTime - thời gian tiếp tục chạy
            // KHÔNG tạo lại câu hỏi
            // KHÔNG reset đáp án

            return await CreatePracticeExamResponse(history, exam, "Xác thực thành công. Tiếp tục bài thi.");
        }

        // Helper: Tạo câu hỏi cho practice exam
        private async Task GeneratePracticeQuestions(Guid pracExamHistoryId, int assignedPaperId)
        {
            // Xóa tất cả câu hỏi cũ trước
            var existingQuestions = await _context.QuestionPracExams
                .Where(q => q.PracExamHistoryId == pracExamHistoryId)
                .ToListAsync();

            if (existingQuestions.Any())
            {
                _context.QuestionPracExams.RemoveRange(existingQuestions);
                await _context.SaveChangesAsync();
            }

            // Tạo câu hỏi mới từ đề thi được gán
            var questions = await _context.PracticeTestQuestions
                .Where(q => q.PracExamPaperId == assignedPaperId)
                .OrderBy(q => q.QuestionOrder)
                .ToListAsync();

            foreach (var q in questions)
            {
                await _context.QuestionPracExams.AddAsync(new QuestionPracExam
                {
                    PracExamHistoryId = pracExamHistoryId,
                    PracticeQuestionId = q.PracticeQuestionId,
                    Answer = "",
                    Score = 0
                });
            }
            await _context.SaveChangesAsync();
        }

        // Helper: Tạo response object
        private async Task<PracticeExamInfoResponseDTO> CreatePracticeExamResponse(PracticeExamHistory history, PracticeExam exam, string message)
        {
            // Lấy thông tin sinh viên
            var student = await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.StudentId == history.StudentId);

            // Lấy danh sách câu hỏi
            var questionDetails = await (from q in _context.QuestionPracExams
                                         join pq in _context.PracticeQuestions on q.PracticeQuestionId equals pq.PracticeQuestionId
                                         join ptq in _context.PracticeTestQuestions on new { q.PracticeQuestionId, PaperId = history.PracExamPaperId } equals new { ptq.PracticeQuestionId, PaperId = (int?)ptq.PracExamPaperId }
                                         where q.PracExamHistoryId == history.PracExamHistoryId
                                         orderby ptq.QuestionOrder
                                         select new PracticeExamQuestionDetailDTO
                                         {
                                             QuestionOrder = ptq.QuestionOrder,
                                             Content = pq.Content,
                                             AnswerContent = q.Answer,
                                             Score = ptq.Score
                                         }).ToListAsync();

            return new PracticeExamInfoResponseDTO
            {
                PracExamHistoryId = history.PracExamHistoryId,
                StudentFullName = student?.User?.Fullname,
                StudentCode = student?.User?.Code,
                SubjectName = exam.Subject.SubjectName,
                ExamCategoryName = exam.CategoryExam.CategoryExamName,
                Duration = exam.Duration,
                StartTime = history.StartTime, // QUAN TRỌNG: Trả về StartTime cho frontend
                Message = message,
                Questions = questionDetails
            };
        }

        public async Task<List<QuestionOrderDTO>> GetQuestionAndAnswerByPracExamId(int pracExamId)
        {
            // Lấy tất cả các đề thi thuộc bài thi này
            var paperIds = await _context.NoPEPaperInPEs
                .Where(x => x.PracExamId == pracExamId)
                .Select(x => x.PracExamPaperId)
                .ToListAsync();

            // Lấy tất cả các câu hỏi và thứ tự trong các đề
            var questions = await _context.PracticeTestQuestions
                .Where(q => paperIds.Contains(q.PracExamPaperId))
                .Select(q => new QuestionOrderDTO
                {
                    PracticeQuestionId = q.PracticeQuestionId,
                    QuestionOrder = q.QuestionOrder
                })
                .ToListAsync();

            return questions;
        }

        public async Task<List<PracticeAnswerOfQuestionDTO>> GetPracticeAnswerOfQuestion(int pracExamId)
        {
            // Lấy tất cả các đề thi thuộc bài thi này
            var paperIds = await _context.NoPEPaperInPEs
                .Where(x => x.PracExamId == pracExamId)
                .Select(x => x.PracExamPaperId)
                .ToListAsync();

            // Lấy tất cả các câu hỏi thuộc các đề này
            var questionIds = await _context.PracticeTestQuestions
                .Where(q => paperIds.Contains(q.PracExamPaperId))
                .Select(q => q.PracticeQuestionId)
                .Distinct()
                .ToListAsync();

            // Lấy đáp án và nội dung câu hỏi
            var result = await _context.PracticeAnswers
                .Where(a => questionIds.Contains(a.PracticeQuestionId))
                .Join(_context.PracticeQuestions,
                      answer => answer.PracticeQuestionId,
                      question => question.PracticeQuestionId,
                      (answer, question) => new PracticeAnswerOfQuestionDTO
                      {
                          AnswerId = answer.AnswerId,
                          QuestionName = question.Content,
                          AnswerContent = answer.AnswerContent
                      })
                .ToListAsync();

            return result;
        }


        public async Task UpdatePEEach5minutesAsync(List<UpdatePracticeExamAnswerDTO> answers)
        {
            foreach (var item in answers)
            {
                var question = await _context.QuestionPracExams
                    .FirstOrDefaultAsync(q => q.PracExamHistoryId == item.PracExamHistoryId && q.PracticeQuestionId == item.PracticeQuestionId);

                if (question != null)
                {
                    question.Answer = item.Answer ?? "";
                }
            }
            await _context.SaveChangesAsync();
        }

        public async Task<SubmitPracticeExamResponseDTO> SubmitPracticeExamAsync(SubmitPracticeExamRequest dto)
        {
            var history = await _context.PracticeExamHistories
                .Include(h => h.PracticeExam)
                    .ThenInclude(e => e.Subject)
                .Include(h => h.Student)
                    .ThenInclude(s => s.User)
                .Include(h => h.QuestionPracExams)
                    .ThenInclude(q => q.PracticeQuestion)
                .FirstOrDefaultAsync(h => h.PracExamHistoryId == dto.PracExamHistoryId);

            if (history == null)
                throw new Exception("Không tìm thấy lịch sử bài thi.");

            if (history.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM.ToLower().Trim())
                throw new Exception("Bài thi đã được nộp, không thể nộp lại.");

            // Xóa toàn bộ câu trả lời cũ của sinh viên này
            var existingAnswers = await _context.QuestionPracExams
                .Where(q => q.PracExamHistoryId == dto.PracExamHistoryId)
                .ToListAsync();
            
            if (existingAnswers.Any())
            {
                _context.QuestionPracExams.RemoveRange(existingAnswers);
                await _context.SaveChangesAsync();
            }

            // Thêm câu trả lời mới
            foreach (var answer in dto.Answers)
            {
                var newQuestionPracExam = new QuestionPracExam
                {
                    PracExamHistoryId = dto.PracExamHistoryId,
                    PracticeQuestionId = answer.PracticeQuestionId,
                    Answer = answer.Answer ?? "",
                    Score = 0 // PE không chấm tự động
                };
                _context.QuestionPracExams.Add(newQuestionPracExam);
            }

            // Cập nhật trạng thái bài thi
            history.StatusExam = PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM.Trim();
            history.EndTime = DateTime.Now;
            await _context.SaveChangesAsync();

            // Tính thời gian làm bài
            string timeTaken = "";
            if (history.StartTime.HasValue && history.EndTime.HasValue)
            {
                var duration = history.EndTime.Value - history.StartTime.Value;
                timeTaken = $"{duration.Hours:D2}:{duration.Minutes:D2}:{duration.Seconds:D2}";
            }

            // Lấy lại dữ liệu câu hỏi sau khi đã cập nhật
            var questionResults = await (from q in _context.QuestionPracExams
                                         join pq in _context.PracticeQuestions on q.PracticeQuestionId equals pq.PracticeQuestionId
                                         where q.PracExamHistoryId == dto.PracExamHistoryId
                                         select new PracticeExamQuestionResultDTO
                                         {
                                             PracticeQuestionId = q.PracticeQuestionId,
                                             QuestionContent = pq.Content,
                                             StudentAnswer = q.Answer
                                         }).ToListAsync();

            return new SubmitPracticeExamResponseDTO
            {
                ExamName = history.PracticeExam.PracExamName,
                SubjectName = history.PracticeExam.Subject.SubjectName,
                StudentName = history.Student.User.Fullname,
                StudentCode = history.Student.User.Code,
                TimeTaken = timeTaken,
                QuestionResults = questionResults
            };
        }
    }
    
    
}
