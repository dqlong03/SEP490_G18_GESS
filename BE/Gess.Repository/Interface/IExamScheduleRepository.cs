using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.ExamSlotRoomDTO;
using GESS.Model.Student;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IExamScheduleRepository
    {
        Task<bool> CheckInStudentAsync(int examSlotId, Guid studentId);
        Task<ExamSlotRoomDetail> GetExamBySlotIdsAsync(int examSlotId);
        Task<IEnumerable<ExamSlotRoom>> GetExamScheduleByTeacherIdAsync(Guid teacherId, DateTime fromDate, DateTime toDate);
        Task<IEnumerable<StudentCheckIn>> GetStudentsByExamSlotIdAsync(int examSlotId);
        Task<bool> RefreshExamCodeAsync(int examSlotId, string codeStart);
    }
}
