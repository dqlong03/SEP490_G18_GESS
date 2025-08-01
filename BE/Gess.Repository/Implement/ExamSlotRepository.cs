using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Subject;
using GESS.Repository.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using GESS.Model.RoomDTO;
using GESS.Model.Teacher;
namespace GESS.Repository.Implement
{
    public class ExamSlotRepository : IExamSlotRepository
    {
        private readonly GessDbContext _context;
        public ExamSlotRepository(GessDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<GradeTeacherResponse>> GetAllGradeTeacherAsync(int majorId, int subjectId)
        {
            var gradeTeachers = await _context.SubjectTeachers
                .Include(gt => gt.Teacher)
                .ThenInclude(t => t.User)
                .Where(gt => gt.SubjectId == subjectId
                             && gt.Teacher != null
                             && gt.Teacher.MajorId == majorId
                             && gt.Teacher.User != null)
                .Select(gt => new GradeTeacherResponse
                {
                    TeacherId = gt.TeacherId,
                    FullName = gt.Teacher.User.Fullname
                })
                .ToListAsync();

            return gradeTeachers;
        }


        public async Task<IEnumerable<RoomListDTO>> GetAllRoomsAsync()
        {
            var rooms = await _context.Rooms
                .Select(r => new RoomListDTO
                {
                    RoomId = r.RoomId,
                    RoomName = r.RoomName,
                    Capacity = r.Capacity
                }).Where( r => r.Status == "Available")
                .ToListAsync();
            return rooms;
        }

        public async Task<IEnumerable<SubjectDTODDL>> GetAllSubjectsByMajorIdAsync(int majorId)
        {
            // Lấy chương trình đào tạo mới nhất theo MajorId
            var latestTrainingProgram = await _context.TrainingPrograms
                .Where(tp => tp.MajorId == majorId)
                .OrderByDescending(tp => tp.StartDate) 
                .FirstOrDefaultAsync();

            // Nếu không có chương trình nào thì trả về danh sách rỗng
            if (latestTrainingProgram == null)
            {
                return new List<SubjectDTODDL>();
            }

            // Lấy các môn học theo chương trình đào tạo mới nhất
            var subjects = await _context.SubjectTrainingPrograms
                .Where(s => s.TrainProId == latestTrainingProgram.TrainProId)
                .Select(s => new SubjectDTODDL
                {
                    SubjectId = s.SubjectId,
                    SubjectName = s.Subject.SubjectName
                })
                .ToListAsync();

            return subjects;
        }

        public bool IsRoomAvailable(int roomId, DateTime slotStart, DateTime slotEnd)
        {
            var examDate = slotStart.Date;

            var examSlotRooms = _context.ExamSlotRooms
                .Include(e => e.ExamSlot)
                .Where(e => e.RoomId == roomId)
                .ToList(); 

            return !examSlotRooms.Any(e =>
            {
                var start = examDate + e.ExamSlot.StartTime;
                var end = examDate + e.ExamSlot.EndTime;
                return start < slotEnd && end > slotStart;
            });
        }


    }

}