using Gess.Repository.Infrastructures;
using GESS.Common;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.MultiExamHistories;
using GESS.Model.MultipleExam;
using GESS.Model.PracticeExam;
using GESS.Model.PracticeExamPaper;
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


        //
        public async Task<bool> UpdatePracticeExamAsync(Model.PracticeExam.PracticeExamUpdateDTO2 dto)
        {
            var exam = await _context.PracticeExams
                .Include(e => e.PracticeExamHistories)
                .FirstOrDefaultAsync(e => e.PracExamId == dto.PracExamId);

            if (exam == null) return false;

            // Update fields
            exam.PracExamName = dto.PracExamName;
            exam.Duration = dto.Duration;
            exam.StartDay = dto.StartDay;
            exam.EndDay = dto.EndDay;
            exam.CreateAt = dto.CreateAt;
            exam.TeacherId = dto.TeacherId;
            exam.CategoryExamId = dto.CategoryExamId;
            exam.SubjectId = dto.SubjectId;
            exam.ClassId = dto.ClassId;
            exam.Status = dto.Status;
            exam.SemesterId = dto.SemesterId;

            // Xử lý cập nhật danh sách đề thi (PracticeExamPaper)
            var oldPapers = _context.NoPEPaperInPEs.Where(x => x.PracExamId == exam.PracExamId);
            _context.NoPEPaperInPEs.RemoveRange(oldPapers);
            if (dto.PracticeExamPaperDTO != null)
            {
                foreach (var paper in dto.PracticeExamPaperDTO)
                {
                    _context.NoPEPaperInPEs.Add(new NoPEPaperInPE
                    {
                        PracExamId = exam.PracExamId,
                        PracExamPaperId = paper.PracExamPaperId
                    });
                }
            }

            // Xử lý cập nhật danh sách sinh viên (PracticeExamHistory)
            var oldHistories = _context.PracticeExamHistories.Where(h => h.PracExamId == exam.PracExamId);
            _context.PracticeExamHistories.RemoveRange(oldHistories);
            if (dto.StudentIds != null)
            {
                foreach (var studentId in dto.StudentIds)
                {
                    _context.PracticeExamHistories.Add(new PracticeExamHistory
                    {
                        PracExamHistoryId = Guid.NewGuid(),
                        PracExamId = exam.PracExamId,
                        StudentId = studentId,
                        CheckIn = false,
                        IsGraded = false
                    });
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }


        //
        public async Task<Model.PracticeExam.PracticeExamUpdateDTO2> GetPracticeExamForUpdateAsync(int pracExamId)
        {
            var exam = await _context.PracticeExams
                .Include(e => e.PracticeExamHistories)
                .FirstOrDefaultAsync(e => e.PracExamId == pracExamId);

            if (exam == null) return null;

            // Lấy danh sách đề thi qua bảng trung gian
            var examPapers = await _context.NoPEPaperInPEs
                .Where(n => n.PracExamId == pracExamId)
                .Include(n => n.PracticeExamPaper)
                .Select(n => n.PracticeExamPaper)
                .ToListAsync();

            return new Model.PracticeExam.PracticeExamUpdateDTO2
            {
                PracExamId = exam.PracExamId,
                PracExamName = exam.PracExamName,
                Duration = exam.Duration,
                StartDay = exam.StartDay,
                EndDay = exam.EndDay,
                CreateAt = exam.CreateAt,
                TeacherId = exam.TeacherId,
                CategoryExamId = exam.CategoryExamId,
                SubjectId = exam.SubjectId,
                ClassId = exam.ClassId??0,
                Status = exam.Status,
                SemesterId = exam.SemesterId,
                PracticeExamPaperDTO = examPapers.Select(p => new PracticeExamPaperDTO
                {
                    PracExamPaperId = p.PracExamPaperId,
                    PracExamPaperName = p.PracExamPaperName,
                    Year = DateTime.Now.Year.ToString(),
                    Semester = exam.SemesterId.ToString(),
                }).ToList(),
                StudentIds = exam.PracticeExamHistories?.Select(h => h.StudentId).Distinct().ToList() ?? new List<Guid>()
            };
        }


        public async Task<PracticeExam> CreatePracticeExamAsync(PracticeExamCreateDTO practiceExamCreateDto)
        {
            // 1. Validate PracExamName - không được để trống
            if (string.IsNullOrWhiteSpace(practiceExamCreateDto.PracExamName))
            {
                throw new Exception("Tên kỳ thi không được để trống!");
            }

            // 2. Validate PracExamName - không được trùng tên trong cùng học kỳ và năm
            var existingExamWithSameName = await _context.PracticeExams
                .Where(e => e.PracExamName == practiceExamCreateDto.PracExamName 
                           && e.SemesterId == practiceExamCreateDto.SemesterId 
                           && e.CreateAt.Year == practiceExamCreateDto.CreateAt.Year)
                .FirstOrDefaultAsync();

            if (existingExamWithSameName != null)
            {
                throw new Exception($"Đã tồn tại kỳ thi với tên '{practiceExamCreateDto.PracExamName}' trong học kỳ này!");
            }

            // 3. Validate Duration - phải lớn hơn 0
            if (practiceExamCreateDto.Duration <= 0)
            {
                throw new Exception("Thời gian làm bài phải lớn hơn 0 phút!");
            }

            // 4. Validate StartDay - không được null và phải lớn hơn hoặc bằng ngày hiện tại
            if (practiceExamCreateDto.StartDay == default(DateTime))
            {
                throw new Exception("Ngày bắt đầu thi không được để trống!");
            }

            if (practiceExamCreateDto.StartDay < DateTime.Now.Date)
            {
                throw new Exception("Ngày bắt đầu thi không được nhỏ hơn ngày hiện tại!");
            }

            // 5. Validate EndDay - không được null và phải lớn hơn StartDay
            if (practiceExamCreateDto.EndDay == default(DateTime))
            {
                throw new Exception("Ngày kết thúc thi không được để trống!");
            }

            if (practiceExamCreateDto.EndDay < DateTime.Now.Date)
            {
                throw new Exception("Ngày kết thúc thi không được nhỏ hơn ngày hiện tại!");
            }

            if (practiceExamCreateDto.EndDay <= practiceExamCreateDto.StartDay)
            {
                throw new Exception("Ngày kết thúc thi phải lớn hơn ngày bắt đầu thi!");
            }

            // 6. Validate CreateAt - không được null
            if (practiceExamCreateDto.CreateAt == default(DateTime))
            {
                throw new Exception("Ngày tạo kỳ thi không được để trống!");
            }

            // 7. Validate TeacherId - phải tồn tại
            var teacher = await _context.Teachers.FindAsync(practiceExamCreateDto.TeacherId);
            if (teacher == null)
            {
                throw new Exception("Giáo viên không tồn tại!");
            }

            // 8. Validate CategoryExamId - phải tồn tại
            var categoryExam = await _context.CategoryExams.FindAsync(practiceExamCreateDto.CategoryExamId);
            if (categoryExam == null)
            {
                throw new Exception("Danh mục kỳ thi không tồn tại!");
            }

            // 9. Validate SubjectId - phải tồn tại
            var subject = await _context.Subjects.FindAsync(practiceExamCreateDto.SubjectId);
            if (subject == null)
            {
                throw new Exception("Môn học không tồn tại!");
            }

            // 10. Validate ClassId - phải tồn tại
            var classEntity = await _context.Classes.FindAsync(practiceExamCreateDto.ClassId);
            if (classEntity == null)
            {
                throw new Exception("Lớp học không tồn tại!");
            }

            // 11. Validate SemesterId - phải tồn tại
            var semester = await _context.Semesters.FindAsync(practiceExamCreateDto.SemesterId);
            if (semester == null)
            {
                throw new Exception("Học kỳ không tồn tại!");
            }

            // 12. Validate PracticeExamPaperDTO - không được null và các PracExamPaperId phải tồn tại
            if (practiceExamCreateDto.PracticeExamPaperDTO == null || !practiceExamCreateDto.PracticeExamPaperDTO.Any())
            {
                throw new Exception("Danh sách đề thi không được để trống!");
            }

            foreach (var paper in practiceExamCreateDto.PracticeExamPaperDTO)
            {
                var examPaper = await _context.PracticeExamPapers.FindAsync(paper.PracExamPaperId);
                if (examPaper == null)
                {
                    throw new Exception($"Đề thi với ID {paper.PracExamPaperId} không tồn tại!");
                }
            }

            // 13. Validate StudentIds - không được null và các StudentId phải tồn tại
            if (practiceExamCreateDto.StudentIds == null || !practiceExamCreateDto.StudentIds.Any())
            {
                throw new Exception("Danh sách sinh viên không được để trống!");
            }

            foreach (var studentId in practiceExamCreateDto.StudentIds)
            {
                var student = await _context.Students.FindAsync(studentId);
                if (student == null)
                {
                    throw new Exception($"Sinh viên với ID {studentId} không tồn tại!");
                }
            }

            var practiceExam = new PracticeExam
            {
                PracExamName = practiceExamCreateDto.PracExamName,
                Duration = practiceExamCreateDto.Duration,
                StartDay = practiceExamCreateDto.StartDay,
                EndDay = practiceExamCreateDto.EndDay,
                TeacherId = practiceExamCreateDto.TeacherId,
                SubjectId = practiceExamCreateDto.SubjectId,
                CreateAt = practiceExamCreateDto.CreateAt,
                CategoryExamId = practiceExamCreateDto.CategoryExamId,
                SemesterId = practiceExamCreateDto.SemesterId,
                ClassId = practiceExamCreateDto.ClassId,
                Status = "Chưa mở ca", // Luôn đặt status mặc định
                CodeStart = Guid.NewGuid().ToString().Substring(0, 6), // Tạo mã thi ngẫu nhiên 6 ký tự
                IsGraded = 0 // Chưa chấm điểm
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
                        PracExamHistoryId = Guid.NewGuid(),
                        PracExamId = practiceExam.PracExamId,
                        StudentId = studentId,
                        CheckIn = false,
                        IsGraded = false,
                        StartTime = practiceExamCreateDto.StartDay,
                        EndTime = practiceExamCreateDto.EndDay,
                        StatusExam = PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM,
                       
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
            // 0. Kiểm tra và xử lý timeout trước tiên
            await CheckAndHandleTimeoutExams();

            // 1. Tìm bài thi
            var exam = await _context.PracticeExams
                .Include(e => e.Subject)
                .Include(e => e.CategoryExam)
                .Include(e => e.NoPEPaperInPEs)
                .ThenInclude(n => n.PracticeExamPaper)
                .FirstOrDefaultAsync(e => e.PracExamId == request.ExamId && e.CodeStart == request.Code);

            if (exam == null)
                throw new Exception("Tên bài thi hoặc mã thi không đúng.");

            // 2. Validate trạng thái theo loại kỳ thi
            bool isMidtermExam = IsMidtermExam(exam.CategoryExam.CategoryExamName);
            StudentExamSlotRoom studentExamSlotRoom = null;
            if (isMidtermExam)
            {
                // Giữa kỳ: kiểm tra qua PracticeExam.Status
                if (!string.Equals(exam.Status?.Trim(), PredefinedStatusAllExam.OPENING_EXAM, StringComparison.OrdinalIgnoreCase))
                    throw new Exception("Bài thi chưa được mở.");
            }
            else
            {
                // Cuối kỳ: kiểm tra qua ExamSlotRoom.Status (0: chưa mở, 1: đang mở, 2: đã đóng)
                studentExamSlotRoom = await _context.StudentExamSlotRoom
                    .Include(s => s.ExamSlotRoom)
                    .FirstOrDefaultAsync(s => s.StudentId == request.StudentId &&
                                              s.ExamSlotRoom.PracticeExamId == exam.PracExamId);

                if (studentExamSlotRoom == null)
                    throw new Exception("Sinh viên không thuộc phòng/ca nào của bài thi này.");

                if (studentExamSlotRoom.ExamSlotRoom.Status != 1)
                    throw new Exception("Bài thi chưa được mở.");
            }

            // 3. VALIDATION: Kiểm tra time frame cho thi giữa kỳ
            
            if (isMidtermExam)
            {
                if (!ValidateExamTimeFrame(exam.StartDay, exam.EndDay))
                {
                    Console.WriteLine($"[DEBUG] Practice midterm exam time validation failed. " +
                        $"Current: {DateTime.Now:yyyy-MM-dd HH:mm:ss}, " +
                        $"StartDay: {exam.StartDay:yyyy-MM-dd HH:mm:ss}, " +
                        $"EndDay: {exam.EndDay:yyyy-MM-dd HH:mm:ss}");
                    
                    throw new Exception($"Kỳ thi giữa kỳ chỉ được thực hiện trong khoảng thời gian từ {exam.StartDay:dd/MM/yyyy HH:mm} đến {exam.EndDay:dd/MM/yyyy HH:mm}.");
                }
                
                Console.WriteLine($"[DEBUG] Practice midterm exam time validation passed. " +
                    $"Current: {DateTime.Now:yyyy-MM-dd HH:mm:ss}, " +
                    $"StartDay: {exam.StartDay:yyyy-MM-dd HH:mm:ss}, " +
                    $"EndDay: {exam.EndDay:yyyy-MM-dd HH:mm:ss}");
            }
            else
            {
                Console.WriteLine($"[DEBUG] Not a practice midterm exam ({exam.CategoryExam.CategoryExamName}), skipping time frame validation.");
            }

            // 4. Lấy danh sách sinh viên và validate
            List<Guid> studentIds;  
            if (exam.ClassId !=  null) // Giữa kỳ
            {
                studentIds = await _context.ClassStudents
                    .Where(cs => cs.ClassId == exam.ClassId)
                    .OrderBy(cs => cs.StudentId)
                    .Select(cs => cs.StudentId)
                    .ToListAsync();
            }
            else // Cuối kỳ
            {
                var examSlotRoomId = studentExamSlotRoom.ExamSlotRoomId;
                studentIds = await _context.StudentExamSlotRoom
                    .Where(s => s.ExamSlotRoomId == examSlotRoomId)
                    .OrderBy(s => s.StudentId)
                    .Select(s => s.StudentId)
                    .ToListAsync();
            }

            // 4. Xác định STT sinh viên
            int stt = studentIds.IndexOf(request.StudentId) + 1;
            if (stt == 0)
                throw new Exception("Sinh viên không thuộc danh sách dự thi.");

            // 5. Lấy danh sách đề thi và chia đề
            var examPapers = exam.NoPEPaperInPEs.Select(n => n.PracExamPaperId).ToList();
            if (examPapers.Count == 0)
                throw new Exception("Chưa có đề thi cho bài thi này.");

            int paperIndex = (stt - 1) % examPapers.Count;
            int assignedPaperId = examPapers[paperIndex];

            // 6. Lấy exam history và phân tích trạng thái
            var history = await _context.PracticeExamHistories
                .FirstOrDefaultAsync(h => h.PracExamId == exam.PracExamId && h.StudentId == request.StudentId);

            if (history == null)
            {
                // TH1: Lần đầu vào thi - tạo history mới
                return await HandleFirstTimePracticeCase(exam, request.StudentId, assignedPaperId);
            }

            // 7. Phân tích trạng thái hiện tại và quyết định hành động
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

            Console.WriteLine($"[DEBUG GENERATE] Paper ID: {assignedPaperId}, Total questions: {questions.Count}");
            foreach (var q in questions)
            {
                Console.WriteLine($"[DEBUG GENERATE] Adding QuestionOrder: {q.QuestionOrder}, PracticeQuestionId: {q.PracticeQuestionId}");
                
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
                                         select new Model.PracticeExam.PracticeExamQuestionDetailDTO
                                         {
                                             PracticeQuestionId = q.PracticeQuestionId, // QUAN TRỌNG: Thêm để frontend submit đúng
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
            // Kiểm tra timeout trước khi update
            await CheckAndHandleTimeoutExams();

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
            Console.WriteLine($"[DEBUG SUBMIT] Total answers to save: {dto.Answers.Count}");
            foreach (var answer in dto.Answers)
            {
                Console.WriteLine($"[DEBUG SUBMIT] Saving PracticeQuestionId: {answer.PracticeQuestionId}, Answer: {answer.Answer?.Substring(0, Math.Min(50, answer.Answer?.Length ?? 0))}...");
                
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

        // Helper: Kiểm tra có phải thi giữa kỳ không
        private bool IsMidtermExam(string categoryExamName)
        {
            if (string.IsNullOrEmpty(categoryExamName))
                return false;
                
            // Sử dụng PredefinedCategoryExam constants thay vì hardcode
            return categoryExamName.Trim().Equals(PredefinedCategoryExam.MidTERM_EXAM_CATEGORY, StringComparison.OrdinalIgnoreCase);
        }

        // Helper: Validation time frame cho thi giữa kỳ  
        private bool ValidateExamTimeFrame(DateTime? startDay, DateTime? endDay)
        {
            var currentTime = DateTime.Now;
            return currentTime >= startDay && currentTime <= endDay;
        }

        // Helper method: Kiểm tra và xử lý timeout tự động
        private async Task CheckAndHandleTimeoutExams()
        {
            // 1. Kiểm tra timeout theo thời gian làm bài (Duration)
            var timeoutExams = await _context.PracticeExamHistories
                .Include(h => h.PracticeExam)
                .Where(h => h.StatusExam == PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM && 
                           h.StartTime.HasValue &&
                           DateTime.Now > h.StartTime.Value.AddMinutes(h.PracticeExam.Duration))
                .ToListAsync();
                
            foreach (var exam in timeoutExams)
            {
                await AutoMarkIncomplete(exam);
            }

            // 2. Kiểm tra khung thời gian cho kỳ thi giữa kỳ (StartDay - EndDay)
            var midtermTimeoutExams = await _context.PracticeExamHistories
                .Include(h => h.PracticeExam)
                    .ThenInclude(m => m.CategoryExam)
                .Where(h => h.StatusExam == PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM &&
                           DateTime.Now > h.PracticeExam.EndDay)
                .ToListAsync();

            foreach (var exam in midtermTimeoutExams)
            {
                // Chỉ xử lý nếu là kỳ thi giữa kỳ
                if (IsMidtermExam(exam.PracticeExam.CategoryExam.CategoryExamName))
                {
                    await AutoMarkIncomplete(exam);
                    Console.WriteLine($"[DEBUG] Auto-marked practice midterm exam as incomplete due to time frame expiry. " +
                                    $"ExamId: {exam.PracticeExam.PracExamId}, EndDay: {exam.PracticeExam.EndDay:dd/MM/yyyy HH:mm}");
                }
            }
            
            if (timeoutExams.Any() || midtermTimeoutExams.Any())
            {
                await _context.SaveChangesAsync();
            }
        }

        // Helper: Tự động đánh dấu bài thi là INCOMPLETE khi timeout
        private async Task AutoMarkIncomplete(PracticeExamHistory history)
        {
            history.StatusExam = PredefinedStatusExamInHistoryOfStudent.INCOMPLETE_EXAM;
            history.EndTime = DateTime.Now;
            history.IsGraded = false;
            
            Console.WriteLine($"[DEBUG] Auto-marked practice exam as INCOMPLETE. " +
                $"HistoryId: {history.PracExamHistoryId}, " +
                $"StartTime: {history.StartTime:yyyy-MM-dd HH:mm:ss}, " +
                $"EndTime: {history.EndTime:yyyy-MM-dd HH:mm:ss}");
        }

       
    }
    
    
}
