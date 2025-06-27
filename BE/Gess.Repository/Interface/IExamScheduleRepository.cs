using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.ExamSlotRoomDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IExamScheduleRepository
    {
        Task<ExamSlotRoomDetail> GetExamBySlotIdsAsync(int examSlotId);
        Task<IEnumerable<ExamSlotRoom>> GetExamScheduleByTeacherIdAsync(Guid teacherId, DateTime fromDate, DateTime toDate);
    }
}
