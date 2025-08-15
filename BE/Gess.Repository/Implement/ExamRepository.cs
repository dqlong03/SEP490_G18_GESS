using Gess.Repository.Infrastructures;
using GESS.Common;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Exam;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class ExamRepository : IExamRepository
    {
        private readonly GessDbContext _context;
        public ExamRepository(GessDbContext context)
        {
            _context = context;
        }

        public async Task<(List<ExamListResponse> Data, int TotalCount)> GetTeacherExamsAsync(
            Guid teacherId,
            int pageNumber,
            int pageSize,
            int? majorId,
            int? semesterId,
            int? subjectId,
           // string? gradeComponent,
            string? examType,
            string? searchName)
        {
            var multipleExamsQuery = _context.MultiExams
                .Where(e => e.TeacherId == teacherId)
                .Where(e => !majorId.HasValue || e.Teacher.MajorId == majorId)
                .Where(e => !semesterId.HasValue || e.SemesterId == semesterId)
                .Where(e => !subjectId.HasValue || e.SubjectId == subjectId)
               // .Where(e => string.IsNullOrEmpty(gradeComponent) || e.GradeComponent == gradeComponent)
                .Where(e => string.IsNullOrEmpty(searchName) || e.MultiExamName.Contains(searchName))
                .Select(e => new ExamListResponse
                {
                    ExamId = e.MultiExamId,
                    SemesterName = e.Semester.SemesterName,
                    ExamName = e.MultiExamName,
                    ExamType = e.CategoryExam.CategoryExamName,
                    //StatusExam = e.MultiExamHistories.Any(),
                    StatusExam = e.Status,
                    CreateDate = e.CreateAt
                });

            var practiceExamsQuery = _context.PracticeExams
                .Where(e => e.TeacherId == teacherId)
                .Where(e => !majorId.HasValue || e.Teacher.MajorId == majorId)
                .Where(e => !semesterId.HasValue || e.SemesterId == semesterId)
                .Where(e => !subjectId.HasValue || e.SubjectId == subjectId)
                .Where(e => string.IsNullOrEmpty(searchName) || e.PracExamName.Contains(searchName))
                .Select(e => new ExamListResponse
                {
                    ExamId = e.PracExamId,
                    SemesterName = e.Semester.SemesterName,
                    ExamName = e.PracExamName,
                    ExamType = e.CategoryExam.CategoryExamName,
                    //StatusExam = e.PracticeExamHistories.Any(),
                    StatusExam = e.Status,
                    CreateDate = e.CreateAt
                });

            var allExamsQuery = multipleExamsQuery.Concat(practiceExamsQuery);

            if (!string.IsNullOrEmpty(examType))
            {
                allExamsQuery = allExamsQuery.Where(e => e.ExamType == examType);
            }

            var totalCount = await allExamsQuery.CountAsync();
            var data = await allExamsQuery
                .OrderByDescending(e => e.CreateDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (data, totalCount);
        }

        public async Task<bool> UpdatePracticeExamAsync(PracticeExamUpdateDTO dto)
        {
            var exam = await _context.PracticeExams.FirstOrDefaultAsync(e => e.PracExamId == dto.PracExamId);
            if (exam == null || exam.Status.ToLower().Trim() != PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM.ToLower().Trim()) // chỉ cho sửa khi chưa thi
                return false;

            exam.PracExamName = dto.PracExamName;
            exam.Duration = dto.Duration;
            exam.CreateAt = dto.CreateAt;
            exam.CategoryExamId = dto.CategoryExamId;
            exam.SubjectId = dto.SubjectId;
            exam.SemesterId = dto.SemesterId;
            // Cập nhật các trường khác nếu cần

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateMultiExamAsync(MultiExamUpdateDTO dto)
        {
            var exam = await _context.MultiExams.FirstOrDefaultAsync(e => e.MultiExamId == dto.MultiExamId);
            if (exam == null || exam.Status.ToLower() != "chưa thi") // chỉ cho sửa khi chưa thi
                return false;

            exam.MultiExamName = dto.MultiExamName;
            exam.NumberQuestion = dto.NumberQuestion;
            exam.Duration = dto.Duration;
            exam.CreateAt = dto.CreateAt;
            exam.CategoryExamId = dto.CategoryExamId;
            exam.SubjectId = dto.SubjectId;
            exam.SemesterId = dto.SemesterId;
            // Cập nhật các trường khác nếu cần

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<ExamListOfStudentResponse>> GetAllMultiExamOfStudentAsync(ExamFilterRequest request)
        {
            // Lấy năm mới nhất từ CreateAt của MultiExam
            var latestYear = await _context.MultiExams
                .MaxAsync(me => (int?)me.CreateAt.Year) ?? DateTime.Now.Year;

            // Lấy học kỳ mới nhất trong năm mới nhất
            var latestSemesterId = await _context.MultiExams
                .Where(me => me.CreateAt.Year == latestYear)
                .Join(_context.Semesters,
                    me => me.SemesterId,
                    s => s.SemesterId,
                    (me, s) => s.SemesterId)
                .OrderByDescending(semesterId => semesterId)
                .FirstOrDefaultAsync();

            if (latestSemesterId == 0)
                return new List<ExamListOfStudentResponse>();

            var query = _context.StudentExamSlotRoom
                .Where(sesr => sesr.StudentId == request.StudentId)
                .Join(_context.ExamSlotRooms,
                    sesr => sesr.ExamSlotRoomId,
                    esr => esr.ExamSlotRoomId,
                    (sesr, esr) => new { StudentExamSlotRoom = sesr, ExamSlotRoom = esr })
                .Where(x => x.ExamSlotRoom.SemesterId == latestSemesterId
                    && x.ExamSlotRoom.MultiExamId != null
                    && x.ExamSlotRoom.ExamDate.Year == latestYear
                    && x.ExamSlotRoom.Status == 1) // Kiểm tra trạng thái ca thi: Đang mở ca
                .Join(_context.MultiExams,
                    x => x.ExamSlotRoom.MultiExamId,
                    me => me.MultiExamId,
                    (x, me) => new { x.StudentExamSlotRoom, x.ExamSlotRoom, MultiExam = me })
                .Join(_context.MultiExamHistories,
                    x => new { x.MultiExam.MultiExamId, x.StudentExamSlotRoom.StudentId },
                    meh => new { meh.MultiExamId, meh.StudentId },
                    (x, meh) => new { x.StudentExamSlotRoom, x.ExamSlotRoom, x.MultiExam, MultiExamHistory = meh })
                .Where(x => x.MultiExamHistory.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM.ToLower().Trim()
                    || x.MultiExamHistory.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM.ToLower().Trim())
                .Join(_context.Subjects,
                    x => x.MultiExam.SubjectId,
                    s => s.SubjectId,
                    (x, s) => new { x.StudentExamSlotRoom, x.ExamSlotRoom, x.MultiExam, x.MultiExamHistory, SubjectName = s.SubjectName })
                .Join(_context.ExamSlots,
                    x => x.ExamSlotRoom.ExamSlotId,
                    es => es.ExamSlotId,
                    (x, es) => new { x.StudentExamSlotRoom, x.ExamSlotRoom, x.MultiExam, x.MultiExamHistory, x.SubjectName, ExamSlot = es })
                .Join(_context.Rooms,
                    x => x.ExamSlotRoom.RoomId,
                    r => r.RoomId,
                    (x, r) => new ExamListOfStudentResponse
                    {
                        ExamId = x.MultiExam.MultiExamId,
                        ExamName = x.MultiExam.MultiExamName,
                        SubjectName = x.SubjectName,
                        Duration = x.MultiExam.Duration,
                        Status = x.MultiExam.Status,
                        ExamDate = x.ExamSlotRoom.ExamDate,
                        RoomName = r.RoomName,
                        ExamSlotName = x.ExamSlot.SlotName,
                        StartTime = x.ExamSlot.StartTime,
                        EndTime = x.ExamSlot.EndTime
                    });

            return await query.ToListAsync();
        }


        public async Task<List<ExamListOfStudentResponse>> GetAllPracExamOfStudentAsync(ExamFilterRequest request)
        {
            // Lấy năm mới nhất từ CreateAt của MultiExam
            var latestYear = await _context.PracticeExams
                .MaxAsync(me => (int?)me.CreateAt.Year) ?? DateTime.Now.Year;

            // Lấy học kỳ mới nhất trong năm mới nhất
            var latestSemesterId = await _context.PracticeExams
                .Where(me => me.CreateAt.Year == latestYear)
                .Join(_context.Semesters,
                    me => me.SemesterId,
                    s => s.SemesterId,
                    (me, s) => s.SemesterId)
                .OrderByDescending(semesterId => semesterId)
                .FirstOrDefaultAsync();

            if (latestSemesterId == 0)
                return new List<ExamListOfStudentResponse>();

            var query = _context.StudentExamSlotRoom
                .Where(sesr => sesr.StudentId == request.StudentId)
                .Join(_context.ExamSlotRooms,
                    sesr => sesr.ExamSlotRoomId,
                    esr => esr.ExamSlotRoomId,
                    (sesr, esr) => new { StudentExamSlotRoom = sesr, ExamSlotRoom = esr })
                .Where(x => x.ExamSlotRoom.SemesterId == latestSemesterId
                    && x.ExamSlotRoom.PracticeExamId != null
                    && x.ExamSlotRoom.ExamDate.Year == latestYear
                    && x.ExamSlotRoom.Status == 1)
                .Join(_context.PracticeExams,
                    x => x.ExamSlotRoom.PracticeExamId,
                    me => me.PracExamId,
                    (x, me) => new { x.StudentExamSlotRoom, x.ExamSlotRoom, PracticeExam = me })
                .Join(_context.PracticeExamHistories,
                    x => new { x.PracticeExam.PracExamId, x.StudentExamSlotRoom.StudentId },
                    meh => new { meh.PracExamId, meh.StudentId },
                    (x, meh) => new { x.StudentExamSlotRoom, x.ExamSlotRoom, x.PracticeExam, PracticeExamHistory = meh })
                .Where(x => x.PracticeExamHistory.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM.ToLower().Trim()
                    || x.PracticeExamHistory.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM.ToLower().Trim())
                .Join(_context.Subjects,
                    x => x.PracticeExam.SubjectId,
                    s => s.SubjectId,
                    (x, s) => new { x.StudentExamSlotRoom, x.ExamSlotRoom, x.PracticeExam, x.PracticeExamHistory, SubjectName = s.SubjectName })
                .Join(_context.ExamSlots,
                    x => x.ExamSlotRoom.ExamSlotId,
                    es => es.ExamSlotId,
                    (x, es) => new { x.StudentExamSlotRoom, x.ExamSlotRoom, x.PracticeExam, x.PracticeExamHistory, x.SubjectName, ExamSlot = es })
                .Join(_context.Rooms,
                    x => x.ExamSlotRoom.RoomId,
                    r => r.RoomId,
                    (x, r) => new ExamListOfStudentResponse
                    {
                        ExamId = x.PracticeExam.PracExamId,
                        ExamName = x.PracticeExam.PracExamName,
                        SubjectName = x.SubjectName,
                        Duration = x.PracticeExam.Duration,
                        Status = x.PracticeExam.Status,
                        ExamDate = x.ExamSlotRoom.ExamDate,
                        RoomName = r.RoomName,
                        ExamSlotName = x.ExamSlot.SlotName,
                        StartTime = x.ExamSlot.StartTime,
                        EndTime = x.ExamSlot.EndTime
                    });

            return await query.ToListAsync();
        }

        public async Task<ExamStatusCheckListResponseDTO> CheckExamStatusAsync(ExamStatusCheckRequestDTO request)
        {
            var result = new ExamStatusCheckListResponseDTO();
            
            // Kiểm tra MultiExam nếu ExamType = "Multi" hoặc null
            if (string.IsNullOrEmpty(request.ExamType) || request.ExamType.Equals("Multi", StringComparison.OrdinalIgnoreCase))
            {
                var multiExams = await _context.MultiExams
                    .Where(m => request.ExamIds.Contains(m.MultiExamId))
                    .ToListAsync();
                
                foreach (var exam in multiExams)
                {
                    result.Exams.Add(new ExamStatusCheckResponseDTO
                    {
                        ExamId = exam.MultiExamId,
                        ExamName = exam.MultiExamName,
                        ExamType = "MultiExam",
                        Status = exam.Status ?? ""
                    });
                }
            }

            // Kiểm tra PracticeExam nếu ExamType = "Practice" hoặc null
            if (string.IsNullOrEmpty(request.ExamType) || request.ExamType.Equals("Practice", StringComparison.OrdinalIgnoreCase))
            {
                var practiceExams = await _context.PracticeExams
                    .Where(p => request.ExamIds.Contains(p.PracExamId))
                    .ToListAsync();
                
                foreach (var exam in practiceExams)
                {
                    result.Exams.Add(new ExamStatusCheckResponseDTO
                    {
                        ExamId = exam.PracExamId,
                        ExamName = exam.PracExamName,
                        ExamType = "PracticeExam",
                        Status = exam.Status ?? ""
                    });
                }
            }

            return result;
        }
    }
}
