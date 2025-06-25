using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Chapter;
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

    }

}
