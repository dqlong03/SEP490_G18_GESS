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
    public interface IExamScheduleService : IBaseService<ExamSlotRoom>
    {
        Task <ExamSlotRoomDetail> GetExamBySlotIdsAsync(int examSlotId);
        Task<IEnumerable<ExamSlotRoomDTO>> GetExamScheduleByTeacherIdAsync(Guid teacherId, DateTime fromDate, DateTime toDate);
        Task<IEnumerable<StudentCheckIn>> GetStudentsByExamSlotIdAsync(int examSlotId);
    }
}
