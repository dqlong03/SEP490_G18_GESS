using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Chapter;
using GESS.Model.ExamSlotRoomDTO;
using GESS.Model.Student;
using GESS.Model.Subject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.examSchedule
{
    public class ExamScheduleService : BaseService<ExamSlotRoom>, IExamScheduleService
    {
        private readonly IUnitOfWork _unitOfWork;
        public ExamScheduleService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> CheckInStudentAsync(int examSlotId, Guid studentId)
        {            
            return await _unitOfWork.ExamScheduleRepository.CheckInStudentAsync(examSlotId, studentId);
        }

        public async Task<ExamSlotRoomDetail> GetExamBySlotIdsAsync(int examSlotId)
        {
            var examSlotRoom = await _unitOfWork.ExamScheduleRepository.GetExamBySlotIdsAsync(examSlotId);
            if (examSlotRoom == null)
            {
                return null;
            }
            return examSlotRoom;
        }

        public async Task<IEnumerable<ExamSlotRoomDTO>> GetExamScheduleByTeacherIdAsync(Guid teacherId, DateTime fromDate, DateTime toDate)
        {
            var examSchedules = await _unitOfWork.ExamScheduleRepository.GetExamScheduleByTeacherIdAsync(teacherId, fromDate, toDate);
            if (examSchedules == null || !examSchedules.Any())
            {
                return new List<ExamSlotRoomDTO>();
            }
            var examScheduleDtos = examSchedules.Select(schedule => new ExamSlotRoomDTO
            {
                ExamSlotRoomId = schedule.ExamSlotRoomId,
                SubjectName = schedule.Subject?.SubjectName ?? "N/A",
                ExamDate = schedule.MultiOrPractice.Equals("Multiple")
                    ? (schedule.MultiExam?.StartDay ?? DateTime.MinValue)
                    : (schedule.PracticeExam?.StartDay ?? DateTime.MinValue),
                RoomName = schedule.Room?.RoomName ?? "N/A",
                ExamSlotId = schedule.ExamSlotId,
                StartDay = schedule.MultiOrPractice.Equals("Multiple")
                    ? (schedule.MultiExam?.StartDay ?? DateTime.MinValue)
                    : (schedule.PracticeExam?.StartDay ?? DateTime.MinValue),
                EndDay = schedule.MultiOrPractice.Equals("Multiple")
                    ? (schedule.MultiExam?.EndDay ?? DateTime.MinValue)
                    : (schedule.PracticeExam?.EndDay ?? DateTime.MinValue),
            });
            return examScheduleDtos;
        }

        public async Task<IEnumerable<StudentCheckIn>> GetStudentsByExamSlotIdAsync(int examSlotId)
        {
            var students = await _unitOfWork.ExamScheduleRepository.GetStudentsByExamSlotIdAsync(examSlotId);
            if (students == null || !students.Any())
            {
                return new List<StudentCheckIn>();
            }
            return students;
        }

        public async Task<string> RefreshExamCodeAsync(int examSlotId)
        {
            //random codestart 000000 to 999999
            var codeStart = new Random().Next(0, 1000000).ToString("D6");
            var isUpdated = await _unitOfWork.ExamScheduleRepository.RefreshExamCodeAsync(examSlotId, codeStart);
            if (isUpdated)
            {
                return codeStart;
            }
            else
            {
                throw new Exception("Failed to refresh exam code. Please try again.");
            }
        }
    }

}
