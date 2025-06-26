using GESS.Entity.Entities;
using GESS.Model.ExamSlot;
using GESS.Model.ExamSlotRoomDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.examSlotService
{
    public interface IExamSlotService : IBaseService<ExamSlot>
    {
        Task<IEnumerable<ExamSlotDTO>> GetAllExamSlotsAsync();
    }
}
