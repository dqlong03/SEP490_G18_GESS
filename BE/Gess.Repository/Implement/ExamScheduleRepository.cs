using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.ExamSlotRoomDTO;
using GESS.Model.MultiExamHistories;
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
                            if(multiExamHistory.Result.CheckIn)
                            {
                                multiExamHistory.Result.CheckIn = false;
                            }
                            else
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
                            if (practiceExamHistory.Result.CheckIn)
                            {
                                practiceExamHistory.Result.CheckIn = false;
                            }
                            else
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
                    .Include(e => e.ExamSlot)
                    .FirstOrDefaultAsync();

                if (examSlotRoom == null)
                {
                    return null;
                }

                var examDate = examSlotRoom.MultiOrPractice.Equals("Multiple")
                    ? examSlotRoom.MultiExam?.StartDay
                    : examSlotRoom.PracticeExam?.StartDay;

              
                var examSlotRoomDetail = new ExamSlotRoomDetail
                {
                    ExamSlotRoomId = examSlotRoom.ExamSlotRoomId,
                    SubjectName = examSlotRoom.Subject?.SubjectName ?? "N/A",
                    ExamDate = examDate.Value, // Explicitly cast nullable DateTime to DateTime
                    RoomName = examSlotRoom.Room?.RoomName ?? "N/A",
                    SlotName = examSlotRoom.ExamSlot?.SlotName ?? "N/A",
                    ExamName = examSlotRoom.MultiOrPractice.Equals("Multiple")
                        ? examSlotRoom.MultiExam?.MultiExamName
                        : examSlotRoom.PracticeExam?.PracExamName,
                    StartTime = examSlotRoom.ExamSlot?.StartTime,
                    EndTime = examSlotRoom.ExamSlot?.EndTime,
                    Code = examSlotRoom.MultiOrPractice.Equals("Multiple")
                        ? examSlotRoom.MultiExam?.CodeStart
                        : examSlotRoom.PracticeExam?.CodeStart,
                    Status = examSlotRoom.Status
                };

                return examSlotRoomDetail;
            }

        public async Task<IEnumerable<ExamSlotRoom>> GetExamScheduleByTeacherIdAsync(Guid teacherId, DateTime fromDate, DateTime toDate)
        {
            var examSchedules = await _context.ExamSlotRooms
                .Where(e => e.SupervisorId == teacherId &&
                   (fromDate<=e.ExamDate && e.ExamDate<=toDate)
                )
                .Include(e => e.Subject)
                .Include(e => e.Room)
                .Include(e => e.MultiExam)
                .Include(e => e.PracticeExam)
                    .Include(e => e.ExamSlot)
                .ToListAsync();
            if (examSchedules == null || !examSchedules.Any())
            {
                return new List<ExamSlotRoom>();
            }
            return examSchedules;
        }

        public async Task<MultipleExamDetail> GetMultiMidTermExamBySlotIdsAsync(Guid teacherId, int examId)
        {
            var multiExam = await _context.MultiExams
                .Where(m => m.MultiExamId == examId)
                .Include(m => m.Subject)
                .Include(m => m.CategoryExam)
                .FirstOrDefaultAsync();
            if (multiExam == null)
                {
                return null;
            }
            var students = await _context.MultiExamHistories
                .Where(m => m.MultiExamId == multiExam.MultiExamId)
                .Select(m => new StudentCheckIn
                {
                    Id = m.StudentId,
                    IsCheckedIn = m.CheckIn == true ? 1 : 0,
                    FullName = m.Student.User.Fullname,
                    AvatarURL = m.Student.AvatarURL,
                    Code = m.Student.User.Code,
                    StatusExamHistory = m.StatusExam // Trạng thái bài thi của học sinh trong lịch sử thi

                })
                .ToListAsync();
            if (students == null || !students.Any())
            {
                students = new List<StudentCheckIn>();
            }
            var multiExamDetail = new MultipleExamDetail
            {
                MultiExamId = multiExam.MultiExamId,
                ExamName = multiExam.MultiExamName,
                SubjectName = multiExam.Subject?.SubjectName ?? "N/A",
                Status = multiExam.Status,
                Duration = multiExam.Duration,
                Category = multiExam.CategoryExam.CategoryExamName,
                Students = students,
                Code = multiExam.CodeStart
            };
            if (multiExamDetail == null)
            {
                multiExamDetail = new MultipleExamDetail();
            }
            return multiExamDetail;
        }

        public async Task<PraticeExamDetail> GetPracMidTermExamBySlotIdsAsync(Guid teacherId, int examId)
        {
            var pracExam = await _context.PracticeExams
               .Where(m => m.PracExamId == examId)
               .Include(m => m.Subject)
               .Include(m => m.CategoryExam)
               .FirstOrDefaultAsync();
            if (pracExam == null)
            {
                return null;
            }
            var students = await _context.PracticeExamHistories
                .Where(m => m.PracExamId == pracExam.PracExamId)
                .Select(m => new StudentCheckIn
                {
                    Id = m.StudentId,
                    IsCheckedIn = m.CheckIn == true ? 1 : 0,
                    FullName = m.Student.User.Fullname,
                    AvatarURL = m.Student.AvatarURL,
                    Code = m.Student.User.Code,
                    StatusExamHistory = m.StatusExam
                })
                .ToListAsync();
            if (students == null || !students.Any())
            {
                students = new List<StudentCheckIn>();
            }
            var pracExamDetail = new PraticeExamDetail
            {
                PracExamId = pracExam.PracExamId,
                ExamName = pracExam.PracExamName,
                SubjectName = pracExam.Subject?.SubjectName ?? "N/A",
                Status = pracExam.Status,
                Duration = pracExam.Duration,
                Category = pracExam.CategoryExam.CategoryExamName,
                Students = students,
                Code = pracExam.CodeStart
            };
            return pracExamDetail;
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
                            Code = m.Student.User.Code,
                            StatusExamHistory = m.StatusExam // Trạng thái bài thi của học sinh trong lịch sử thi
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
                            Code = p.Student.User.Code,
                            StatusExamHistory = p.StatusExam // Trạng thái bài thi của học sinh trong lịch sử thi
                        })
                        .ToListAsync();
                    return practiceExamHistories;
                }
            }
            return Enumerable.Empty<StudentCheckIn>();
        }

        public async Task<bool> MidTermCheckInStudentAsync(int examId, Guid studentId, int examType)
        {
            // Validate examType - chỉ chấp nhận 1 (Multiple choice) hoặc 2 (Practice)
            if (examType != 1 && examType != 2)
            {
                return false;
            }

            if (examType == 1)
            {
                var examHistory = await _context.MultiExamHistories
                    .FirstOrDefaultAsync(m => m.MultiExamId == examId && m.StudentId == studentId);

                if (examHistory == null)
                {
                    return false;
                }

                // Đánh dấu đã check-in
                examHistory.CheckIn = true;

                _context.MultiExamHistories.Update(examHistory);
                await _context.SaveChangesAsync();
                return true;
            }
            else if (examType == 2)
            {
                var examHistory = await _context.PracticeExamHistories
                    .FirstOrDefaultAsync(m => m.PracExamId == examId && m.StudentId == studentId);

                if (examHistory == null)
                {
                    return false;
                }

                // Đánh dấu đã check-in
                examHistory.CheckIn = true;

                _context.PracticeExamHistories.Update(examHistory);
                await _context.SaveChangesAsync();
                return true;
            }
            
            return false;
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

        public async Task<bool> RefreshMidTermExamCodeAsync(int examId, int examType, string codeStart)
        {
           if (examType == 1)
            {
                var multiExam = await _context.MultiExams
                    .FirstOrDefaultAsync(m => m.MultiExamId == examId);
                if (multiExam != null)
                {
                    multiExam.CodeStart = codeStart;
                    _context.MultiExams.Update(multiExam);
                    return await _context.SaveChangesAsync().ContinueWith(t => true);
                }
            }
            else if (examType == 2)
            {
                var practiceExam = await _context.PracticeExams
                    .FirstOrDefaultAsync(p => p.PracExamId == examId);
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
