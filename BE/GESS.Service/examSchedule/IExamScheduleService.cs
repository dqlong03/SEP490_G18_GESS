using GESS.Entity.Entities;
using GESS.Model.Chapter;
using GESS.Model.ExamSlotRoomDTO;
using GESS.Model.MultiExamHistories;
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
        Task<bool> CheckInStudentAsync(int examSlotId, Guid studentId);
        Task <ExamSlotRoomDetail> GetExamBySlotIdsAsync(int examSlotId);
        Task<IEnumerable<ExamSlotRoomDTO>> GetExamScheduleByTeacherIdAsync(Guid teacherId, DateTime fromDate, DateTime toDate);
        Task<MultipleExamDetail> GetMultiMidTermExamBySlotIdsAsync(Guid teacherId, int examId);
        Task<PraticeExamDetail> GetPracMidTermExamBySlotIdsAsync(Guid teacherId, int examId);
        Task<IEnumerable<StudentCheckIn>> GetStudentsByExamSlotIdAsync(int examSlotId);
        Task<bool> MidTermCheckInStudentAsync(int examId, Guid studentId, int examType);
        Task<string> RefreshExamCodeAsync(int examSlotId);
        Task<string> RefreshMidTermExamCodeAsync(int examId, int examType);
    }
}
