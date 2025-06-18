using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.PracticeQuestionDTO;
using GESS.Model.Subject;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.practicequestion
{
    public class PracticeQuestionService : BaseService<PracticeQuestion>, IPracticeQuestionService
    {
        private readonly IUnitOfWork _unitOfWork;
        public PracticeQuestionService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<IEnumerable<PracticeQuestionLitsDTO>> GetAllPracticeQuestionsAsync()
        {
            return await _unitOfWork.PracticeQuestionsRepository.GetAllPracticeQuestionsAsync();
        }
        public async Task<PracticeQuestionCreateDTO> PracticeQuestionCreateAsync(PracticeQuestionCreateDTO dto)
        {
            var practiceQuestion = new PracticeQuestion
            {
                Content = dto.Content,
                UrlImg = dto.UrlImg,
                IsActive = dto.IsActive,
                CreatedBy = dto.CreatedBy,
                IsPublic = dto.IsPublic,
                ChapterId = dto.ChapterId,
                CategoryExamId = dto.CategoryExamId,
                LevelQuestionId = dto.LevelQuestionId,
                SemesterId = dto.SemesterId
            };

            await _unitOfWork.PracticeQuestionsRepository.CreateAsync(practiceQuestion);
            await _unitOfWork.SaveChangesAsync();
            return dto;
        }

    }

}
