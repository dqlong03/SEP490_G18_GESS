using Gess.Repository.Infrastructures;
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

            if (exam.Status != "Published")
                throw new Exception("Bài thi chưa được mở.");

            // 2. Lấy danh sách sinh viên
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

            // 4. Lấy danh sách đề thi
            var examPapers = exam.NoPEPaperInPEs.Select(n => n.PracExamPaperId).ToList();
            if (examPapers.Count == 0)
                throw new Exception("Chưa có đề thi cho bài thi này.");

            // 5. Chia đề cho sinh viên
            int paperIndex = (stt - 1) % examPapers.Count;
            int assignedPaperId = examPapers[paperIndex];

            // 6. Lấy hoặc tạo PracticeExamHistory
            var history = await _context.PracticeExamHistories
                .FirstOrDefaultAsync(h => h.PracExamId == exam.PracExamId && h.StudentId == request.StudentId);

            if (history == null)
            {
                history = new PracticeExamHistory
                {
                    PracExamHistoryId = Guid.NewGuid(),
                    PracExamId = exam.PracExamId,
                    StudentId = request.StudentId,
                    StartTime = DateTime.Now,
                    CheckIn = true,
                    IsGraded = false,
                    StatusExam = "InProgress"
                };
                _context.PracticeExamHistories.Add(history);
                await _context.SaveChangesAsync();
            }

            // 7. Kiểm tra đã có câu hỏi chưa, nếu chưa thì tạo
            var existingQuestions = await _context.QuestionPracExams
                .Where(q => q.PracExamHistoryId == history.PracExamHistoryId)
                .ToListAsync();

            if (!existingQuestions.Any())
            {
                var questions = await _context.PracticeTestQuestions
                    .Where(q => q.PracExamPaperId == assignedPaperId)
                    .OrderBy(q => q.QuestionOrder)
                    .ToListAsync();

                foreach (var q in questions)
                {
                    _context.QuestionPracExams.Add(new QuestionPracExam
                    {
                        PracExamHistoryId = history.PracExamHistoryId,
                        PracticeQuestionId = q.PracticeQuestionId,
                        Answer = "",
                        Score = 0
                    });
                }
                await _context.SaveChangesAsync();
            }

            // 8. Lấy thông tin sinh viên
            var student = await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.StudentId == request.StudentId);

            // 9. Lấy danh sách câu hỏi trả về
            var questionDetails = await (from q in _context.QuestionPracExams
                                         join pq in _context.PracticeQuestions on q.PracticeQuestionId equals pq.PracticeQuestionId
                                         where q.PracExamHistoryId == history.PracExamHistoryId
                                         orderby q.PracticeQuestionId
                                         select new PracticeExamQuestionDetailDTO
                                         {
                                             QuestionOrder = 0, // Nếu cần thứ tự, lấy từ PracticeTestQuestion
                                             Content = pq.Content,
                                             AnswerContent = pq.PracticeAnswer.AnswerContent,
                                             Score = 0 // Nếu cần điểm tối đa, lấy từ PracticeTestQuestion
                                         }).ToListAsync();

            // 10. Trả về kết quả
            return new PracticeExamInfoResponseDTO
            {
                PracExamHistoryId = history.PracExamHistoryId,
                StudentFullName = student?.User?.Fullname,
                StudentCode = student?.User?.Code,
                SubjectName = exam.Subject.SubjectName,
                ExamCategoryName = exam.CategoryExam.CategoryExamName,
                Duration = exam.Duration,
                Message = "Xác thực thành công. Bắt đầu thi.",
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

            if (history.StatusExam == "Completed")
                throw new Exception("Bài thi đã được nộp, không thể nộp lại.");

            // Cập nhật đáp án cho từng câu hỏi
            foreach (var questionExam in history.QuestionPracExams)
            {
                var ans = dto.Answers.FirstOrDefault(a => a.PracticeQuestionId == questionExam.PracticeQuestionId);
                questionExam.Answer = ans?.Answer ?? "";
                // Score luôn là 0, vì PE không chấm tự động
                questionExam.Score = 0;
            }

            // Cập nhật trạng thái bài thi
            history.StatusExam = "Completed";
            history.EndTime = DateTime.Now;
            await _context.SaveChangesAsync();

            // Tính thời gian làm bài
            string timeTaken = "";
            if (history.StartTime.HasValue && history.EndTime.HasValue)
            {
                var duration = history.EndTime.Value - history.StartTime.Value;
                timeTaken = $"{duration.Hours:D2}:{duration.Minutes:D2}:{duration.Seconds:D2}";
            }

            // Chuẩn bị kết quả trả về
            var questionResults = history.QuestionPracExams.Select(q => new PracticeExamQuestionResultDTO
            {
                PracticeQuestionId = q.PracticeQuestionId,
                QuestionContent = q.PracticeQuestion.Content,
                StudentAnswer = q.Answer
            }).ToList();

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
