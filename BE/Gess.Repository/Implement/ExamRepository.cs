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

            var query = _context.MultiExams
                .Where(me => me.CreateAt.Year == latestYear
                    && me.SemesterId == latestSemesterId
                    && (me.Status.ToLower().Trim() == PredefinedStatusAllExam.ONHOLD_EXAM.ToLower().Trim() || me.Status.ToLower().Trim() == PredefinedStatusAllExam.OPENING_EXAM.ToLower().Trim())) 

                .Join(_context.MultiExamHistories,
                    me => me.MultiExamId,
                    meh => meh.MultiExamId,
                    (me, meh) => new { MultiExam = me, MultiExamHistory = meh })

                .Where(x => x.MultiExamHistory.StudentId == request.StudentId
                    && (x.MultiExamHistory.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM.ToLower().Trim() || x.MultiExamHistory.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM.ToLower().Trim())) 
                .Select(x => x.MultiExam)


                .Join(_context.Subjects,
                    me => me.SubjectId,
                    s => s.SubjectId,
                    (me, s) => new { MultiExam = me, SubjectName = s.SubjectName })

                .GroupJoin(_context.ExamSlotRooms,
                    x => x.MultiExam.MultiExamId,
                    esr => esr.MultiExamId,
                    (x, esr) => new { x.MultiExam, x.SubjectName, ExamSlotRooms = esr })
                .SelectMany(x => x.ExamSlotRooms.DefaultIfEmpty(),
                    (x, esr) => new { x.MultiExam, x.SubjectName, ExamSlotRoom = esr })
                .GroupJoin(_context.ExamSlots,
                    x => x.ExamSlotRoom != null ? x.ExamSlotRoom.ExamSlotId : 0,
                    es => es.ExamSlotId,
                    (x, es) => new { x.MultiExam, x.SubjectName, x.ExamSlotRoom, ExamSlots = es })
                .SelectMany(x => x.ExamSlots.DefaultIfEmpty(),
                    (x, es) => new { x.MultiExam, x.SubjectName, x.ExamSlotRoom, ExamSlot = es })
                .GroupJoin(_context.Rooms,
                    x => x.ExamSlotRoom != null ? x.ExamSlotRoom.RoomId : 0,
                    r => r.RoomId,
                    (x, r) => new { x.MultiExam, x.SubjectName, x.ExamSlotRoom, x.ExamSlot, Rooms = r })
                .SelectMany(x => x.Rooms.DefaultIfEmpty(),
                    (x, r) => new ExamListOfStudentResponse
                    {
                        ExamId = x.MultiExam.MultiExamId,
                        ExamName = x.MultiExam.MultiExamName,
                        SubjectName = x.SubjectName,
                        Duration = x.MultiExam.Duration,
                        Status = x.MultiExam.Status,
                        //CodeStart = x.MultiExam.CodeStart,
                        //StartDay = x.MultiExam != null ? x.MultiExam.StartDay : default,
                        //EndDay = x.MultiExam != null ? x.MultiExam.EndDay : default,
                        ExamDate = x.ExamSlotRoom.ExamDate,
                        RoomName = r != null ? r.RoomName : null,
                        ExamSlotName = x.ExamSlot != null ? x.ExamSlot.SlotName : null,
                        StartTime = x.ExamSlot != null ? x.ExamSlot.StartTime : default,
                        EndTime = x.ExamSlot != null ? x.ExamSlot.EndTime : default,
                        //ExamSlotRoom = x.ExamSlotRoom
                    });


            return await query.ToListAsync();
        }
    
        public async Task<List<ExamListOfStudentResponse>> GetAllPracExamOfStudentAsync(ExamFilterRequest request)
        {
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

            var query = _context.PracticeExams
                .Where(me => me.CreateAt.Year == latestYear
                    && me.SemesterId == latestSemesterId
                    && (me.Status.ToLower().Trim() == PredefinedStatusAllExam.ONHOLD_EXAM.ToLower().Trim() || me.Status.ToLower().Trim() == PredefinedStatusAllExam.OPENING_EXAM.ToLower().Trim()))

                .Join(_context.PracticeExamHistories,
                    me => me.PracExamId,
                    meh => meh.PracExamId,
                    (me, meh) => new { PracticeExam = me, PracticeExamHistory = meh })

                .Where(x => x.PracticeExamHistory.StudentId == request.StudentId
                    && (x.PracticeExamHistory.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM.ToLower().Trim() || x.PracticeExamHistory.StatusExam == PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM.ToLower().Trim()))
                .Select(x => x.PracticeExam)


                .Join(_context.Subjects,
                    me => me.SubjectId,
                    s => s.SubjectId,
                    (me, s) => new { PracticeExam = me, SubjectName = s.SubjectName })

                .GroupJoin(_context.ExamSlotRooms,
                    x => x.PracticeExam.PracExamId,
                    esr => esr.PracticeExamId,
                    (x, esr) => new { x.PracticeExam, x.SubjectName, ExamSlotRooms = esr })
                .SelectMany(x => x.ExamSlotRooms.DefaultIfEmpty(),

                    (x, esr) => new { x.PracticeExam, x.SubjectName, ExamSlotRoom = esr })
                .GroupJoin(_context.ExamSlots,
                    x => x.ExamSlotRoom != null ? x.ExamSlotRoom.ExamSlotId : 0,
                    es => es.ExamSlotId,
                    (x, es) => new { x.PracticeExam, x.SubjectName, x.ExamSlotRoom, ExamSlots = es })
                .SelectMany(x => x.ExamSlots.DefaultIfEmpty(),
                    (x, es) => new { x.PracticeExam, x.SubjectName, x.ExamSlotRoom, ExamSlot = es })

                .GroupJoin(_context.Rooms,
                    x => x.ExamSlotRoom != null ? x.ExamSlotRoom.RoomId : 0,
                    r => r.RoomId,
                    (x, r) => new { x.PracticeExam, x.SubjectName, x.ExamSlotRoom, x.ExamSlot, Rooms = r })
                .SelectMany(x => x.Rooms.DefaultIfEmpty(),
                    (x, r) => new ExamListOfStudentResponse
                    {
                        ExamId = x.PracticeExam.PracExamId,
                        ExamName = x.PracticeExam.PracExamName,
                        SubjectName = x.SubjectName,
                        Duration = x.PracticeExam.Duration,
                        Status = x.PracticeExam.Status,
                        //CodeStart = x.PracticeExam.CodeStart,
                        //StartDay = x.PracticeExam != null ? x.PracticeExam.StartDay : default,
                        //EndDay = x.PracticeExam != null ? x.PracticeExam.EndDay : default,
                        ExamDate = x.ExamSlotRoom.ExamDate,
                        RoomName = r != null ? r.RoomName : null,
                        ExamSlotName = x.ExamSlot != null ? x.ExamSlot.SlotName : null,
                        StartTime = x.ExamSlot != null ? x.ExamSlot.StartTime : default,
                        EndTime = x.ExamSlot != null ? x.ExamSlot.EndTime : default,
                        // ExamSlotRoom = x.ExamSlotRoom
                    });


            return await query.ToListAsync();
        }
    }
}
