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
                ExamDate = schedule.MultiOrPractice.Equals("Multiple") ? schedule.MultiExam.ExamDate: schedule.PracticeExam.ExamDate,
                RoomName = schedule.Room?.RoomName ?? "N/A",
                ExamSlotId = schedule.ExamSlotId
            });
            return examScheduleDtos;

        }

        public Task<IEnumerable<StudentCheckIn>> GetStudentsByExamSlotIdAsync(int examSlotId)
        {
            throw new NotImplementedException();
        }
    }

}
