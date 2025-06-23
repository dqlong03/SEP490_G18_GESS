using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.MultipleQuestionDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.multianswer
{
    public class MultiAnswerService : BaseService<MultiAnswer>, IMultiAnswerService
    {
        private readonly IUnitOfWork _unitOfWork;
        public MultiAnswerService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<List<MultiAnswerOfQuestionDTO>> GetAllMultiAnswerOfQuestionAsync(int multiQuestionId)
        {
            return await _unitOfWork.MultipleAnswerRepository.GetAllMultiAnswerOfQuestionAsync(multiQuestionId);
        }
    }
}
