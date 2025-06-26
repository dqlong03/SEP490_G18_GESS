using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.ExamSlot;
using GESS.Service.examSchedule;
using GESS.Service.examSlotService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.examSlotService
{
    public class ExamSlotService : BaseService<ExamSlot>, IExamSlotService
    {
        private readonly IUnitOfWork _unitOfWork;
        public ExamSlotService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<ExamSlotDTO>> GetAllExamSlotsAsync()
        {
            var examSlots = await _unitOfWork.BaseRepository<ExamSlot>().GetAllAsync();
            if (examSlots == null || !examSlots.Any())
            {
                return new List<ExamSlotDTO>();
            }
            var examSlotDtos = examSlots.Select(slot => new ExamSlotDTO
            {
                ExamSlotId = slot.ExamSlotId,
                StartTime = slot.StartTime,
                EndTime = slot.EndTime,
                SlotName = slot.SlotName
            });
            return examSlotDtos;
        }
    }
}
