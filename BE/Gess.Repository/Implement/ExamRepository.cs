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

        //public async Task<List<ExamListOfStudentResponse>> GetAllMultiExamOfStudentAsync(ExamFilterRequest request)
        //{
        //    // Lấy năm mới nhất từ CreateAt của MultiExam
        //    var latestYear = await _context.MultiExams
        //        .MaxAsync(me => (int?)me.CreateAt.Year) ?? DateTime.Now.Year;

        //    // Lấy học kỳ mới nhất trong năm mới nhất
        //    var latestSemesterId = await _context.MultiExams
        //        .Where(me => me.CreateAt.Year == latestYear)
        //        .Join(_context.Semesters,
        //            me => me.SemesterId,
        //            s => s.SemesterId,
        //            (me, s) => s.SemesterId)
        //        .OrderByDescending(semesterId => semesterId)
        //        .FirstOrDefaultAsync();

        //    if (latestSemesterId == 0)
        //        return new List<ExamListOfStudentResponse>();

        //    // Query cho bài giữa kỳ (Midterm)
        //    var midtermQuery = _context.ClassStudents
        // .Where(cs => cs.StudentId == request.StudentId)
        // .Join(_context.Classes,
        //     cs => cs.ClassId,
        //     c => c.ClassId,
        //     (cs, c) => new { ClassStudent = cs, Class = c })
        // .Join(_context.MultiExams,
        //     x => x.Class.ClassId,
        //     me => me.ClassId,
        //     (x, me) => new { x.ClassStudent, x.Class, MultiExam = me })
        // .Where(x => x.MultiExam.SemesterId == latestSemesterId
        //     && x.MultiExam.CreateAt.Year == latestYear
        //     && x.MultiExam.ClassId != null
        //     && x.MultiExam.Status.ToLower().Trim() == "đang mở ca".ToLower().Trim())
        // .Join(_context.MultiExamHistories,
        //     x => new { x.MultiExam.MultiExamId, x.ClassStudent.StudentId },
        //     meh => new { meh.MultiExamId, meh.StudentId },
        //     (x, meh) => new { x.ClassStudent, x.Class, x.MultiExam, MultiExamHistory = meh })
        // .Where(x => x.MultiExamHistory.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM.ToLower().Trim()
        //     || x.MultiExamHistory.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM.ToLower().Trim())
        // .Join(_context.Subjects,
        //     x => x.MultiExam.SubjectId,
        //     s => s.SubjectId,
        //     (x, s) => new { x.ClassStudent, x.Class, x.MultiExam, x.MultiExamHistory, SubjectName = s.SubjectName })
        // .Select(x => new ExamListOfStudentResponse
        // {
        //     ExamId = x.MultiExam.MultiExamId,
        //     ExamName = x.MultiExam.MultiExamName,
        //     SubjectName = x.SubjectName,
        //     Duration = x.MultiExam.Duration,
        //     Status = x.MultiExam.Status,
        //     ExamDate = x.MultiExam.EndDay,
        //     RoomName = x.Class.ClassName,
        //     ExamSlotName = $"{x.MultiExam.StartDay:dd/MM/yyyy HH:mm} - {x.MultiExam.EndDay:dd/MM/yyyy HH:mm}",
        //     StartTime = default,
        //     EndTime = default
        // });

        //    // Query cho bài cuối kỳ (Final)
        //    var finalQuery = _context.StudentExamSlotRoom
        //        .Where(sesr => sesr.StudentId == request.StudentId)
        //        .Join(_context.ExamSlotRooms,
        //            sesr => sesr.ExamSlotRoomId,
        //            esr => esr.ExamSlotRoomId,
        //            (sesr, esr) => new { StudentExamSlotRoom = sesr, ExamSlotRoom = esr })
        //        .Where(x => x.ExamSlotRoom.SemesterId == latestSemesterId
        //            && x.ExamSlotRoom.MultiExamId != null
        //            && x.ExamSlotRoom.ExamDate.Year == latestYear
        //            && x.ExamSlotRoom.Status == 1
        //            && x.ExamSlotRoom.MultiExam.ClassId == null)
        //        .Join(_context.MultiExams,
        //            x => x.ExamSlotRoom.MultiExamId,
        //            me => me.MultiExamId,
        //            (x, me) => new { x.StudentExamSlotRoom, x.ExamSlotRoom, MultiExam = me })
        //        .Join(_context.MultiExamHistories,
        //            x => new { x.MultiExam.MultiExamId, x.StudentExamSlotRoom.StudentId },
        //            meh => new { meh.MultiExamId, meh.StudentId },
        //            (x, meh) => new { x.StudentExamSlotRoom, x.ExamSlotRoom, x.MultiExam, MultiExamHistory = meh })
        //        .Where(x => x.MultiExamHistory.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM.ToLower().Trim()
        //            || x.MultiExamHistory.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM.ToLower().Trim())
        //        .Join(_context.Subjects,
        //            x => x.MultiExam.SubjectId,
        //            s => s.SubjectId,
        //            (x, s) => new { x.StudentExamSlotRoom, x.ExamSlotRoom, x.MultiExam, x.MultiExamHistory, SubjectName = s.SubjectName })
        //        .Join(_context.ExamSlots,
        //            x => x.ExamSlotRoom.ExamSlotId,
        //            es => es.ExamSlotId,
        //            (x, es) => new { x.StudentExamSlotRoom, x.ExamSlotRoom, x.MultiExam, x.MultiExamHistory, x.SubjectName, ExamSlot = es })
        //        .Join(_context.Rooms,
        //            x => x.ExamSlotRoom.RoomId,
        //            r => r.RoomId,
        //            (x, r) => new ExamListOfStudentResponse
        //            {
        //                ExamId = x.MultiExam.MultiExamId,
        //                ExamName = x.MultiExam.MultiExamName,
        //                SubjectName = x.SubjectName,
        //                Duration = x.MultiExam.Duration,
        //                Status = x.MultiExam.Status,
        //                ExamDate = x.ExamSlotRoom.ExamDate,
        //                RoomName = r.RoomName,
        //                ExamSlotName = x.ExamSlot.SlotName,
        //                StartTime = x.ExamSlot.StartTime,
        //                EndTime = x.ExamSlot.EndTime
        //            });

        //    // Kết hợp hai query và loại bỏ trùng lặp
        //    var combinedQuery = midtermQuery.Union(finalQuery);

        //    return await combinedQuery.ToListAsync();
        //}

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

            // Lấy tất cả StudentId liên quan đến email của request.StudentId
            var studentIds = await _context.Students
                .Where(s => s.StudentId == request.StudentId)
                .Select(s => s.User.Email)
                .Join(_context.Users,
                    email => email,
                    u => u.Email,
                    (email, u) => u.Id)
                .Join(_context.Students,
                    userId => userId,
                    s => s.UserId,
                    (userId, s) => s.StudentId)
                .ToListAsync();

            // Query gộp: Bắt đầu từ MultiExams, join với histories và subjects, sau đó GroupJoin với midterm và final
            var combinedQuery = _context.MultiExams
                .Where(me => me.SemesterId == latestSemesterId && me.CreateAt.Year == latestYear)
                .Join(_context.Subjects,
                    me => me.SubjectId,
                    s => s.SubjectId,
                    (me, s) => new { MultiExam = me, SubjectName = s.SubjectName })
                .GroupJoin(_context.MultiExamHistories.Where(meh => studentIds.Contains(meh.StudentId)),
                    x => x.MultiExam.MultiExamId,
                    meh => meh.MultiExamId,
                    (x, mehGroup) => new { x.MultiExam, x.SubjectName, MultiExamHistories = mehGroup })
                .SelectMany(x => x.MultiExamHistories.DefaultIfEmpty(),
                    (x, meh) => new { x.MultiExam, x.SubjectName, MultiExamHistory = meh })
                .Where(x => x.MultiExamHistory != null // Đảm bảo có history
                    && (x.MultiExamHistory.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM.ToLower().Trim()
                        || x.MultiExamHistory.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM.ToLower().Trim()))
                // GroupJoin với midterm (ClassStudents và Classes) nếu ClassId != null và Status = "Đang mở ca"
                .GroupJoin(_context.ClassStudents.Where(cs => studentIds.Contains(cs.StudentId)),
                    x => x.MultiExam.ClassId,
                    cs => cs.ClassId,
                    (x, csGroup) => new { x.MultiExam, x.SubjectName, x.MultiExamHistory, ClassStudents = csGroup })
                .SelectMany(x => x.ClassStudents.DefaultIfEmpty(),
                    (x, cs) => new { x.MultiExam, x.SubjectName, x.MultiExamHistory, ClassStudent = cs })
                .GroupJoin(_context.Classes,
                    x => x.ClassStudent != null ? x.ClassStudent.ClassId : 0,
                    c => c.ClassId,
                    (x, cGroup) => new { x.MultiExam, x.SubjectName, x.MultiExamHistory, x.ClassStudent, Classes = cGroup })
                .SelectMany(x => x.Classes.DefaultIfEmpty(),
                    (x, c) => new { x.MultiExam, x.SubjectName, x.MultiExamHistory, x.ClassStudent, Class = c })
                // GroupJoin với final (StudentExamSlotRooms, ExamSlotRooms, ExamSlots, Rooms) nếu ClassId == null
                .GroupJoin(_context.StudentExamSlotRoom.Where(sesr => studentIds.Contains(sesr.StudentId)),
                    x => x.MultiExam.MultiExamId, // Join dựa trên MultiExamId cho final
                    sesr => sesr.ExamSlotRoom.MultiExamId ?? 0,
                    (x, sesrGroup) => new { x.MultiExam, x.SubjectName, x.MultiExamHistory, x.ClassStudent, x.Class, StudentExamSlotRooms = sesrGroup })
                .SelectMany(x => x.StudentExamSlotRooms.DefaultIfEmpty(),
                    (x, sesr) => new { x.MultiExam, x.SubjectName, x.MultiExamHistory, x.ClassStudent, x.Class, StudentExamSlotRoom = sesr })
                .GroupJoin(_context.ExamSlotRooms.Where(esr => esr.Status == 1 && esr.SemesterId == latestSemesterId && esr.ExamDate.Year == latestYear),
                    x => x.StudentExamSlotRoom != null ? x.StudentExamSlotRoom.ExamSlotRoomId : 0,
                    esr => esr.ExamSlotRoomId,
                    (x, esrGroup) => new { x.MultiExam, x.SubjectName, x.MultiExamHistory, x.ClassStudent, x.Class, x.StudentExamSlotRoom, ExamSlotRooms = esrGroup })
                .SelectMany(x => x.ExamSlotRooms.DefaultIfEmpty(),
                    (x, esr) => new { x.MultiExam, x.SubjectName, x.MultiExamHistory, x.ClassStudent, x.Class, x.StudentExamSlotRoom, ExamSlotRoom = esr })
                .GroupJoin(_context.ExamSlots,
                    x => x.ExamSlotRoom != null ? x.ExamSlotRoom.ExamSlotId : 0,
                    es => es.ExamSlotId,
                    (x, esGroup) => new { x.MultiExam, x.SubjectName, x.MultiExamHistory, x.ClassStudent, x.Class, x.StudentExamSlotRoom, x.ExamSlotRoom, ExamSlots = esGroup })
                .SelectMany(x => x.ExamSlots.DefaultIfEmpty(),
                    (x, es) => new { x.MultiExam, x.SubjectName, x.MultiExamHistory, x.ClassStudent, x.Class, x.StudentExamSlotRoom, x.ExamSlotRoom, ExamSlot = es })
                .GroupJoin(_context.Rooms,
                    x => x.ExamSlotRoom != null ? x.ExamSlotRoom.RoomId : 0,
                    r => r.RoomId,
                    (x, rGroup) => new { x.MultiExam, x.SubjectName, x.MultiExamHistory, x.ClassStudent, x.Class, x.StudentExamSlotRoom, x.ExamSlotRoom, x.ExamSlot, Rooms = rGroup })
                .SelectMany(x => x.Rooms.DefaultIfEmpty(),
                    (x, r) => new { x.MultiExam, x.SubjectName, x.MultiExamHistory, x.ClassStudent, x.Class, x.StudentExamSlotRoom, x.ExamSlotRoom, x.ExamSlot, Room = r })
                // Lọc cuối cùng dựa trên midterm/final
                .Where(x => (x.MultiExam.ClassId != null && x.ClassStudent != null && x.Class != null && x.MultiExam.Status.ToLower().Trim() == "Đang mở ca".ToLower().Trim())
                    || (x.MultiExam.ClassId == null && x.StudentExamSlotRoom != null && x.ExamSlotRoom != null && x.ExamSlotRoom.Status == 1 && x.ExamSlotRoom.MultiExamId != null && x.ExamSlot != null && x.Room != null))
                // Select để tạo DTO
                .Select(x => new ExamListOfStudentResponse
                {
                    ExamId = x.MultiExam.MultiExamId,
                    ExamName = x.MultiExam.MultiExamName,
                    SubjectName = x.SubjectName,
                    Duration = x.MultiExam.Duration,
                    Status = x.MultiExam.Status,
                    ExamDate = x.ExamSlotRoom != null ? x.ExamSlotRoom.ExamDate : x.MultiExam.EndDay ?? default(DateTime),
                   // RoomName = x.Room != null ? x.Room.RoomName : x.Class.ClassName,
                    RoomName = x.Room != null ? x.Room.RoomName : "-",
                   // ExamSlotName = x.ExamSlot != null ? x.ExamSlot.SlotName : $"{x.MultiExam.StartDay:dd/MM/yyyy HH:mm} - {x.MultiExam.EndDay:dd/MM/yyyy HH:mm}",
                    ExamSlotName = x.ExamSlot != null ? x.ExamSlot.SlotName : "-",
                    StartTime = x.ExamSlot != null ? x.ExamSlot.StartTime : default,
                    EndTime = x.ExamSlot != null ? x.ExamSlot.EndTime : default
                });

            return await combinedQuery.ToListAsync();
        }


        //public async Task<List<ExamListOfStudentResponse>> GetAllPracExamOfStudentAsync(ExamFilterRequest request)
        //{
        //    // Lấy năm mới nhất từ CreateAt của PracticeExam
        //    var latestYear = await _context.PracticeExams
        //        .MaxAsync(pe => (int?)pe.CreateAt.Year) ?? DateTime.Now.Year;

        //    // Lấy học kỳ mới nhất trong năm mới nhất
        //    var latestSemesterId = await _context.PracticeExams
        //        .Where(pe => pe.CreateAt.Year == latestYear)
        //        .Join(_context.Semesters,
        //            pe => pe.SemesterId,
        //            s => s.SemesterId,
        //            (pe, s) => s.SemesterId)
        //        .OrderByDescending(semesterId => semesterId)
        //        .FirstOrDefaultAsync();

        //    if (latestSemesterId == 0)
        //        return new List<ExamListOfStudentResponse>();

        //    // Lấy tất cả StudentId liên quan đến email của request.StudentId
        //    var studentIds = await _context.Students
        //        .Where(s => s.StudentId == request.StudentId)
        //        .Select(s => s.User.Email)
        //        .Join(_context.Users,
        //            email => email,
        //            u => u.Email,
        //            (email, u) => u.Id)
        //        .Join(_context.Students,
        //            userId => userId,
        //            s => s.UserId,
        //            (userId, s) => s.StudentId)
        //        .ToListAsync();

        //    // Query cho bài giữa kỳ (Midterm)
        //    var midtermQuery = _context.ClassStudents
        //        .Where(cs => studentIds.Contains(cs.StudentId))
        //        .Join(_context.Classes,
        //            cs => cs.ClassId,
        //            c => c.ClassId,
        //            (cs, c) => new { ClassStudent = cs, Class = c })
        //        .Join(_context.PracticeExams,
        //            x => x.Class.ClassId,
        //            pe => pe.ClassId,
        //            (x, pe) => new { x.ClassStudent, x.Class, PracticeExam = pe })
        //        .Where(x => x.PracticeExam.SemesterId == latestSemesterId
        //            && x.PracticeExam.CreateAt.Year == latestYear
        //            && x.PracticeExam.ClassId != null
        //            && x.PracticeExam.Status.ToLower().Trim() == "Đang mở ca".ToLower().Trim())
        //        .Join(_context.PracticeExamHistories,
        //            x => new { x.PracticeExam.PracExamId, x.ClassStudent.StudentId },
        //            peh => new { peh.PracExamId, peh.StudentId },
        //            (x, peh) => new { x.ClassStudent, x.Class, x.PracticeExam, PracticeExamHistory = peh })
        //        .Where(x => x.PracticeExamHistory.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM.ToLower().Trim()
        //            || x.PracticeExamHistory.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM.ToLower().Trim())
        //        .Join(_context.Subjects,
        //            x => x.PracticeExam.SubjectId,
        //            s => s.SubjectId,
        //            (x, s) => new { x.ClassStudent, x.Class, x.PracticeExam, x.PracticeExamHistory, SubjectName = s.SubjectName })
        //        .Select(x => new ExamListOfStudentResponse
        //        {
        //            ExamId = x.PracticeExam.PracExamId,
        //            ExamName = x.PracticeExam.PracExamName,
        //            SubjectName = x.SubjectName,
        //            Duration = x.PracticeExam.Duration,
        //            Status = x.PracticeExam.Status,
        //            ExamDate = x.PracticeExam.EndDay,
        //            RoomName = x.Class.ClassName,
        //            ExamSlotName = $"{x.PracticeExam.StartDay:dd/MM/yyyy HH:mm} - {x.PracticeExam.EndDay:dd/MM/yyyy HH:mm}",
        //            StartTime = default,
        //            EndTime = default
        //        });

        //    // Query cho bài cuối kỳ (Final)
        //    var finalQuery = _context.StudentExamSlotRoom
        //        .Where(sesr => studentIds.Contains(sesr.StudentId))
        //        .Join(_context.ExamSlotRooms,
        //            sesr => sesr.ExamSlotRoomId,
        //            esr => esr.ExamSlotRoomId,
        //            (sesr, esr) => new { StudentExamSlotRoom = sesr, ExamSlotRoom = esr })
        //        .Where(x => x.ExamSlotRoom.SemesterId == latestSemesterId
        //            && x.ExamSlotRoom.PracticeExamId != null
        //            && x.ExamSlotRoom.ExamDate.Year == latestYear
        //            && x.ExamSlotRoom.Status == 1
        //            && x.ExamSlotRoom.PracticeExam.ClassId == null)
        //        .Join(_context.PracticeExams,
        //            x => x.ExamSlotRoom.PracticeExamId,
        //            pe => pe.PracExamId,
        //            (x, pe) => new { x.StudentExamSlotRoom, x.ExamSlotRoom, PracticeExam = pe })
        //        .Join(_context.PracticeExamHistories,
        //            x => new { x.PracticeExam.PracExamId, x.StudentExamSlotRoom.StudentId },
        //            peh => new { peh.PracExamId, peh.StudentId },
        //            (x, peh) => new { x.StudentExamSlotRoom, x.ExamSlotRoom, x.PracticeExam, PracticeExamHistory = peh })
        //        .Where(x => x.PracticeExamHistory.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM.ToLower().Trim()
        //            || x.PracticeExamHistory.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM.ToLower().Trim())
        //        .Join(_context.Subjects,
        //            x => x.PracticeExam.SubjectId,
        //            s => s.SubjectId,
        //            (x, s) => new { x.StudentExamSlotRoom, x.ExamSlotRoom, x.PracticeExam, x.PracticeExamHistory, SubjectName = s.SubjectName })
        //        .Join(_context.ExamSlots,
        //            x => x.ExamSlotRoom.ExamSlotId,
        //            es => es.ExamSlotId,
        //            (x, es) => new { x.StudentExamSlotRoom, x.ExamSlotRoom, x.PracticeExam, x.PracticeExamHistory, x.SubjectName, ExamSlot = es })
        //        .Join(_context.Rooms,
        //            x => x.ExamSlotRoom.RoomId,
        //            r => r.RoomId,
        //            (x, r) => new ExamListOfStudentResponse
        //            {
        //                ExamId = x.PracticeExam.PracExamId,
        //                ExamName = x.PracticeExam.PracExamName,
        //                SubjectName = x.SubjectName,
        //                Duration = x.PracticeExam.Duration,
        //                Status = x.PracticeExam.Status,
        //                ExamDate = x.ExamSlotRoom.ExamDate,
        //                RoomName = r.RoomName,
        //                ExamSlotName = x.ExamSlot.SlotName,
        //                StartTime = x.ExamSlot.StartTime,
        //                EndTime = x.ExamSlot.EndTime
        //            });

        //    // Kết hợp hai query và loại bỏ trùng lặp
        //   // var combinedQuery = finalQuery.Union(finalQuery);

        //    return await midtermQuery.ToListAsync();
        //}

        public async Task<List<ExamListOfStudentResponse>> GetAllPracExamOfStudentAsync(ExamFilterRequest request)
        {
            // Lấy năm mới nhất từ CreateAt của PracticeExam
            var latestYear = await _context.PracticeExams
                .MaxAsync(pe => (int?)pe.CreateAt.Year) ?? DateTime.Now.Year;

            // Lấy học kỳ mới nhất trong năm mới nhất
            var latestSemesterId = await _context.PracticeExams
                .Where(pe => pe.CreateAt.Year == latestYear)
                .Join(_context.Semesters,
                    pe => pe.SemesterId,
                    s => s.SemesterId,
                    (pe, s) => s.SemesterId)
                .OrderByDescending(semesterId => semesterId)
                .FirstOrDefaultAsync();

            if (latestSemesterId == 0)
                return new List<ExamListOfStudentResponse>();

            // Lấy tất cả StudentId liên quan đến email của request.StudentId
            var studentIds = await _context.Students
                .Where(s => s.StudentId == request.StudentId)
                .Select(s => s.User.Email)
                .Join(_context.Users,
                    email => email,
                    u => u.Email,
                    (email, u) => u.Id)
                .Join(_context.Students,
                    userId => userId,
                    s => s.UserId,
                    (userId, s) => s.StudentId)
                .ToListAsync();

            // Query gộp: Bắt đầu từ PracticeExams, join với histories và subjects, sau đó GroupJoin với midterm và final
            var combinedQuery = _context.PracticeExams
                .Where(pe => pe.SemesterId == latestSemesterId && pe.CreateAt.Year == latestYear)
                .Join(_context.Subjects,
                    pe => pe.SubjectId,
                    s => s.SubjectId,
                    (pe, s) => new { PracticeExam = pe, SubjectName = s.SubjectName })
                .GroupJoin(_context.PracticeExamHistories.Where(peh => studentIds.Contains(peh.StudentId)),
                    x => x.PracticeExam.PracExamId,
                    peh => peh.PracExamId,
                    (x, pehGroup) => new { x.PracticeExam, x.SubjectName, PracticeExamHistories = pehGroup })
                .SelectMany(x => x.PracticeExamHistories.DefaultIfEmpty(),
                    (x, peh) => new { x.PracticeExam, x.SubjectName, PracticeExamHistory = peh })
                .Where(x => x.PracticeExamHistory != null // Đảm bảo có history
                    && (x.PracticeExamHistory.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM.ToLower().Trim()
                        || x.PracticeExamHistory.StatusExam.ToLower().Trim() == PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM.ToLower().Trim()))
                // GroupJoin với midterm (ClassStudents và Classes) nếu ClassId != null và Status = "Đang mở ca"
                .GroupJoin(_context.ClassStudents.Where(cs => studentIds.Contains(cs.StudentId)),
                    x => x.PracticeExam.ClassId,
                    cs => cs.ClassId,
                    (x, csGroup) => new { x.PracticeExam, x.SubjectName, x.PracticeExamHistory, ClassStudents = csGroup })
                .SelectMany(x => x.ClassStudents.DefaultIfEmpty(),
                    (x, cs) => new { x.PracticeExam, x.SubjectName, x.PracticeExamHistory, ClassStudent = cs })
                .GroupJoin(_context.Classes,
                    x => x.ClassStudent != null ? x.ClassStudent.ClassId : 0,
                    c => c.ClassId,
                    (x, cGroup) => new { x.PracticeExam, x.SubjectName, x.PracticeExamHistory, x.ClassStudent, Classes = cGroup })
                .SelectMany(x => x.Classes.DefaultIfEmpty(),
                    (x, c) => new { x.PracticeExam, x.SubjectName, x.PracticeExamHistory, x.ClassStudent, Class = c })
                // GroupJoin với final (StudentExamSlotRooms, ExamSlotRooms, ExamSlots, Rooms) nếu ClassId == null
                .GroupJoin(_context.StudentExamSlotRoom.Where(sesr => studentIds.Contains(sesr.StudentId)),
                    x => x.PracticeExam.PracExamId, // Join dựa trên PracExamId cho final
                    sesr => sesr.ExamSlotRoom.PracticeExamId ?? 0,
                    (x, sesrGroup) => new { x.PracticeExam, x.SubjectName, x.PracticeExamHistory, x.ClassStudent, x.Class, StudentExamSlotRooms = sesrGroup })
                .SelectMany(x => x.StudentExamSlotRooms.DefaultIfEmpty(),
                    (x, sesr) => new { x.PracticeExam, x.SubjectName, x.PracticeExamHistory, x.ClassStudent, x.Class, StudentExamSlotRoom = sesr })
                .GroupJoin(_context.ExamSlotRooms.Where(esr => esr.Status == 1 && esr.SemesterId == latestSemesterId && esr.ExamDate.Year == latestYear),
                    x => x.StudentExamSlotRoom != null ? x.StudentExamSlotRoom.ExamSlotRoomId : 0,
                    esr => esr.ExamSlotRoomId,
                    (x, esrGroup) => new { x.PracticeExam, x.SubjectName, x.PracticeExamHistory, x.ClassStudent, x.Class, x.StudentExamSlotRoom, ExamSlotRooms = esrGroup })
                .SelectMany(x => x.ExamSlotRooms.DefaultIfEmpty(),
                    (x, esr) => new { x.PracticeExam, x.SubjectName, x.PracticeExamHistory, x.ClassStudent, x.Class, x.StudentExamSlotRoom, ExamSlotRoom = esr })
                .GroupJoin(_context.ExamSlots,
                    x => x.ExamSlotRoom != null ? x.ExamSlotRoom.ExamSlotId : 0,
                    es => es.ExamSlotId,
                    (x, esGroup) => new { x.PracticeExam, x.SubjectName, x.PracticeExamHistory, x.ClassStudent, x.Class, x.StudentExamSlotRoom, x.ExamSlotRoom, ExamSlots = esGroup })
                .SelectMany(x => x.ExamSlots.DefaultIfEmpty(),
                    (x, es) => new { x.PracticeExam, x.SubjectName, x.PracticeExamHistory, x.ClassStudent, x.Class, x.StudentExamSlotRoom, x.ExamSlotRoom, ExamSlot = es })
                .GroupJoin(_context.Rooms,
                    x => x.ExamSlotRoom != null ? x.ExamSlotRoom.RoomId : 0,
                    r => r.RoomId,
                    (x, rGroup) => new { x.PracticeExam, x.SubjectName, x.PracticeExamHistory, x.ClassStudent, x.Class, x.StudentExamSlotRoom, x.ExamSlotRoom, x.ExamSlot, Rooms = rGroup })
                .SelectMany(x => x.Rooms.DefaultIfEmpty(),
                    (x, r) => new { x.PracticeExam, x.SubjectName, x.PracticeExamHistory, x.ClassStudent, x.Class, x.StudentExamSlotRoom, x.ExamSlotRoom, x.ExamSlot, Room = r })
                // Lọc cuối cùng dựa trên midterm/final
                .Where(x => (x.PracticeExam.ClassId != null && x.ClassStudent != null && x.Class != null && x.PracticeExam.Status.ToLower().Trim() == "Đang mở ca".ToLower().Trim())
                    || (x.PracticeExam.ClassId == null && x.StudentExamSlotRoom != null && x.ExamSlotRoom != null && x.ExamSlotRoom.Status == 1 && x.ExamSlotRoom.PracticeExamId != null && x.ExamSlot != null && x.Room != null))
                // Select để tạo DTO
                .Select(x => new ExamListOfStudentResponse
                {
                    ExamId = x.PracticeExam.PracExamId,
                    ExamName = x.PracticeExam.PracExamName,
                    SubjectName = x.SubjectName,
                    Duration = x.PracticeExam.Duration,
                    Status = x.PracticeExam.Status,
                    //ExamDate = x.ExamSlotRoom != null ? x.ExamSlotRoom.ExamDate : x.PracticeExam.EndDay ?? default(DateTime),
                    ExamDate = x.ExamSlotRoom != null ? x.ExamSlotRoom.ExamDate : x.PracticeExam.EndDay ?? default(DateTime),
                    //RoomName = x.Room != null ? x.Room.RoomName : x.Class.ClassName,
                    RoomName = x.Room != null ? x.Room.RoomName : "-",
                    //ExamSlotName = x.ExamSlot != null ? x.ExamSlot.SlotName : $"{x.PracticeExam.StartDay:dd/MM/yyyy HH:mm} - {x.PracticeExam.EndDay:dd/MM/yyyy HH:mm}",
                    ExamSlotName = x.ExamSlot != null ? x.ExamSlot.SlotName : "-",
                    StartTime = x.ExamSlot != null ? x.ExamSlot.StartTime : default,
                    EndTime = x.ExamSlot != null ? x.ExamSlot.EndTime : default
                });

            return await combinedQuery.ToListAsync();
        }


        public async Task<ExamStatusCheckListResponseDTO> CheckExamStatusAsync(ExamStatusCheckRequestDTO request)
        {
            var result = new ExamStatusCheckListResponseDTO();

            // Kiểm tra MultiExam nếu ExamType = "Multi" hoặc null
            if (string.IsNullOrEmpty(request.ExamType) || request.ExamType.Equals("Multi", StringComparison.OrdinalIgnoreCase))
            {
                var multiExams = await _context.MultiExams
                    .Include(m => m.CategoryExam)
                    .Where(m => request.ExamIds.Contains(m.MultiExamId))
                    .ToListAsync();

                foreach (var exam in multiExams)
                {
                    string status = "";
                    
                    // Kiểm tra nếu là bài thi cuối kỳ
                    if (exam.CategoryExam?.CategoryExamName == PredefinedCategoryExam.Final_EXAM_CATEGORY)
                    {
                        // Bài thi cuối kỳ - check status từ ExamSlotRoom
                        var examSlotRoom = await _context.ExamSlotRooms
                            .Where(esr => esr.MultiExamId == exam.MultiExamId)
                            .FirstOrDefaultAsync();
                        
                        if (examSlotRoom != null)
                        {
                            status = GetExamSlotRoomStatusText(examSlotRoom.Status);
                        }
                        else
                        {
                            status = "Chưa có ca thi";
                        }
                    }
                    else
                    {
                        // Bài thi giữa kỳ - check status từ MultiExam
                        status = exam.Status ?? "";
                    }
                    
                    result.Exams.Add(new ExamStatusCheckResponseDTO
                    {
                        ExamId = exam.MultiExamId,
                        ExamName = exam.MultiExamName,
                        ExamType = "MultiExam",
                        Status = status
                    });
                }
            }

            // Kiểm tra PracticeExam nếu ExamType = "Practice" hoặc null
            if (string.IsNullOrEmpty(request.ExamType) || request.ExamType.Equals("Practice", StringComparison.OrdinalIgnoreCase))
            {
                var practiceExams = await _context.PracticeExams
                    .Include(p => p.CategoryExam)
                    .Where(p => request.ExamIds.Contains(p.PracExamId))
                    .ToListAsync();

                foreach (var exam in practiceExams)
                {
                    string status = "";
                    
                    // Kiểm tra nếu là bài thi cuối kỳ
                    if (exam.CategoryExam?.CategoryExamName == PredefinedCategoryExam.Final_EXAM_CATEGORY)
                    {
                        // Bài thi cuối kỳ - check status từ ExamSlotRoom
                        var examSlotRoom = await _context.ExamSlotRooms
                            .Where(esr => esr.PracticeExamId == exam.PracExamId)
                            .FirstOrDefaultAsync();
                        
                        if (examSlotRoom != null)
                        {
                            status = GetExamSlotRoomStatusText(examSlotRoom.Status);
                        }
                        else
                        {
                            status = "Chưa có ca thi";
                        }
                    }
                    else
                    {
                        // Bài thi giữa kỳ - check status từ PracticeExam
                        status = exam.Status ?? "";
                    }
                    
                    result.Exams.Add(new ExamStatusCheckResponseDTO
                    {
                        ExamId = exam.PracExamId,
                        ExamName = exam.PracExamName,
                        ExamType = "PracticeExam",
                        Status = status
                    });
                }
            }

            return result;
        }

        /// <summary>
        /// Chuyển đổi status int của ExamSlotRoom sang text mô tả
        /// </summary>
        /// <param name="status">Status int từ ExamSlotRoom</param>
        /// <returns>Text mô tả trạng thái</returns>
        private static string GetExamSlotRoomStatusText(int status)
        {
            return status switch
            {
                0 => "Chưa mở ca",
                1 => "Đang mở ca", 
                2 => "Đã đóng ca",
                _ => "Không xác định"
            };
        }
    }
}
