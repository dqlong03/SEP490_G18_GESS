using Gess.Repository.Infrastructures;
using GESS.Model.LevelQuestionDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.levelquestion
{
    public class LevelQuestionService : BaseService<LevelQuestionService>, ILevelQuestionService
    {
        private readonly IUnitOfWork _unitOfWork;
        public LevelQuestionService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<IEnumerable<LevelQuestionDTO>> GetAllLevelQuestionsAsync()
        {
            var levelQuestions = await _unitOfWork.LevelQuestionRepository.GetAllAsync();
            return levelQuestions.Select(lq => new LevelQuestionDTO
            {
                LevelQuestionId = lq.LevelQuestionId,
                LevelQuestionName = lq.LevelQuestionName,

            });
        }
    }
}
