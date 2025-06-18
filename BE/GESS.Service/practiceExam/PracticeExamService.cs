using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.MultipleExam;
using GESS.Model.PracticeExam;
using GESS.Model.Subject;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.practiceExam
{
    public class PracticeExamService : BaseService<PracticeExam>, IPracticeExamService
    {
        private readonly IUnitOfWork _unitOfWork;
        public PracticeExamService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<PracticeExamCreateDTO> CreatePracticeExamAsync(PracticeExamCreateDTO practiceExamCreateDto)
        {
            var practiceExam = await _unitOfWork.PracticeExamRepository.CreatePracticeExamAsync(practiceExamCreateDto);
            if (practiceExam == null)
            {
                throw new Exception("Lỗi khi tạo bài kiểm tra tự luận.");
            }
            return practiceExamCreateDto;
        }
    }

}
