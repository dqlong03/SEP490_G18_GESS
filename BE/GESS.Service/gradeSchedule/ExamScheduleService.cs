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

namespace GESS.Service.gradeSchedule
{
    public class GradeScheduleService : BaseService<ExamSlotRoom>, IGradeScheduleService
    {
        private readonly IUnitOfWork _unitOfWork;
        public GradeScheduleService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

       
    }

}
