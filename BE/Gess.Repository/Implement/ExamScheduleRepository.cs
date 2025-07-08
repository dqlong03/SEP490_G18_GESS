using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.ExamSlotRoomDTO;
using GESS.Model.Student;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class ExamScheduleRepository : IExamScheduleRepository
    {

        private readonly GessDbContext _context;
        public ExamScheduleRepository(GessDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CheckInStudentAsync(int examSlotId, Guid studentId)
        {
            var checkIn = _context.StudentExamSlotRoom
                .Any(s => s.ExamSlotRoomId == examSlotId && s.StudentId == studentId);
            if (checkIn)
            {
                var examSlotRoom = _context.ExamSlotRooms
                    .FirstOrDefaultAsync(e => e.ExamSlotRoomId == examSlotId);
                if (examSlotRoom != null)
                {
                    if (examSlotRoom.Result.MultiOrPractice == "Multiple")
                    {
                        var multiExamHistory = _context.MultiExamHistories
                            .FirstOrDefaultAsync(m => m.MultiExamId == examSlotRoom.Result.MultiExamId && m.StudentId == studentId);
                        if (multiExamHistory.Result != null)
                        {
                            multiExamHistory.Result.CheckIn = true;
                            _context.MultiExamHistories.Update(multiExamHistory.Result);
                            return await _context.SaveChangesAsync().ContinueWith(t => true);
                        }
                    }
                    else if (examSlotRoom.Result.MultiOrPractice == "Practice")
                    {
                        var practiceExamHistory = _context.PracticeExamHistories
                            .FirstOrDefaultAsync(p => p.PracExamId == examSlotRoom.Result.PracticeExamId && p.StudentId == studentId);
                        if (practiceExamHistory.Result != null)
                            {
                            practiceExamHistory.Result.CheckIn = true;
                            _context.PracticeExamHistories.Update(practiceExamHistory.Result);
                            return await _context.SaveChangesAsync().ContinueWith(t => true);
                        }
                    }
                }
            }
            return await Task.FromResult(false);
        }

        public async Task<ExamSlotRoomDetail> GetExamBySlotIdsAsync(int examSlotId)
        {
            var examSlotRoom = await _context.ExamSlotRooms
                .Where(e => e.ExamSlotRoomId == examSlotId)
                .Include(e => e.Subject)
                .Include(e => e.Room)
                .Include(e => e.MultiExam)
                .Include(e => e.PracticeExam)
                .FirstOrDefaultAsync();
            if (examSlotRoom == null)
            {
                return null;
            }
            var examSlotRoomDetail = new ExamSlotRoomDetail
            {
                ExamSlotRoomId = examSlotRoom.ExamSlotRoomId,
                SubjectName = examSlotRoom.Subject?.SubjectName ?? "N/A",
                ExamDate = examSlotRoom.MultiOrPractice.Equals("Multiple") ? examSlotRoom.MultiExam.StartDay : examSlotRoom.PracticeExam.StartDay,
                RoomName = examSlotRoom.Room?.RoomName ?? "N/A",
                SlotName = examSlotRoom.ExamSlot?.SlotName ?? "N/A",
                ExamName = examSlotRoom.MultiOrPractice.Equals("Multiple") ? examSlotRoom.MultiExam.MultiExamName : examSlotRoom.PracticeExam.PracExamName,
                StartTime = examSlotRoom.ExamSlot?.StartTime,
                EndTime = examSlotRoom.ExamSlot?.EndTime
            };
            return examSlotRoomDetail;
        }

        public async Task<IEnumerable<ExamSlotRoom>> GetExamScheduleByTeacherIdAsync(Guid teacherId, DateTime fromDate, DateTime toDate)
        {
            var examSchedules = await _context.ExamSlotRooms
                .Where(e => e.SupervisorId == teacherId &&
                    (
                        (e.MultiOrPractice == "Multiple" && e.MultiExam.StartDay >= fromDate && e.MultiExam.StartDay <= toDate) ||
                        (e.MultiOrPractice == "Practice" && e.PracticeExam.StartDay >= fromDate && e.PracticeExam.StartDay <= toDate)
                    )
                )
                .Include(e => e.Subject)
                .Include(e => e.Room)
                .Include(e => e.MultiExam)
                .Include(e => e.PracticeExam)
                .ToListAsync();
            if (examSchedules == null || !examSchedules.Any())
            {
                return new List<ExamSlotRoom>();
            }
            return examSchedules;

        }

        public async Task<IEnumerable<StudentCheckIn>> GetStudentsByExamSlotIdAsync(int examSlotId)
        {
            var examSlotRoom = _context.ExamSlotRooms
                    .FirstOrDefaultAsync(e => e.ExamSlotRoomId == examSlotId);
            if (examSlotRoom != null)
            {
                if (examSlotRoom.Result.MultiOrPractice == "Multiple")
                {
                    var multiExamHistories = await _context.MultiExamHistories
                        .Where(m => m.MultiExamId == examSlotRoom.Result.MultiExamId)
                        .Select(m => new StudentCheckIn
                        {
                            Id = m.StudentId,
                            IsCheckedIn = m.CheckIn==true? 1:0,
                            FullName = m.Student.User.Fullname,
                            AvatarURL = m.Student.AvatarURL,
                            Code = m.Student.User.Code
                        })
                        .ToListAsync();
                    return multiExamHistories;
                }
                else if (examSlotRoom.Result.MultiOrPractice == "Practice")
                {
                    var practiceExamHistories = await _context.PracticeExamHistories
                        .Where(p => p.PracExamId == examSlotRoom.Result.PracticeExamId)
                        .Select(p => new StudentCheckIn
                        {
                            Id = p.StudentId,
                            IsCheckedIn = p.CheckIn==true? 1:0,
                            FullName = p.Student.User.Fullname,
                            AvatarURL = p.Student.AvatarURL,
                            Code = p.Student.User.Code
                        })
                        .ToListAsync();
                    return practiceExamHistories;
                }
            }
            return Enumerable.Empty<StudentCheckIn>();
        }

        public async Task<bool> RefreshExamCodeAsync(int examSlotId, string codeStart)
        {
            var examSlotRoom = await _context.ExamSlotRooms
                .FirstOrDefaultAsync(e => e.ExamSlotRoomId == examSlotId);
            if (examSlotRoom == null)
            {
                return false;
            }
            if (examSlotRoom.MultiOrPractice == "Multiple")
            {
                var multiExam = await _context.MultiExams
                    .FirstOrDefaultAsync(m => m.MultiExamId == examSlotRoom.MultiExamId);
                if (multiExam != null)
                {
                    multiExam.CodeStart = codeStart;
                    _context.MultiExams.Update(multiExam);
                    return await _context.SaveChangesAsync().ContinueWith(t => true);
                }
            }
            else if (examSlotRoom.MultiOrPractice == "Practice")
            {
                var practiceExam = await _context.PracticeExams
                    .FirstOrDefaultAsync(p => p.PracExamId == examSlotRoom.PracticeExamId);
                if (practiceExam != null)
                {
                    practiceExam.CodeStart = codeStart;
                    _context.PracticeExams.Update(practiceExam);
                    return await _context.SaveChangesAsync().ContinueWith(t => true);
                }
            }
            return await Task.FromResult(false);
        }
    }
}
