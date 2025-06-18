using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Subject;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.practiceQuestion
{
    public class PracticeQuestionService : BaseService<PracticeQuestion>, IPracticeQuestionService
    {
        private readonly IUnitOfWork _unitOfWork;
        public PracticeQuestionService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

       
    }

}
