using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Subject;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.multipleQuestion
{
    public class MultipleQuestionService : BaseService<MultiQuestion>, IMultipleQuestionService
    {
        private readonly IUnitOfWork _unitOfWork;
        public MultipleQuestionService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<int> GetQuestionCount(int? chapterId, int? categoryId, int? levelId, bool? isPublic, string? createdBy)
        {
            var questionCount = await _unitOfWork.MultipleQuestionRepository.GetQuestionCountAsync(chapterId, categoryId, levelId, isPublic, createdBy);
            if (questionCount < 0)
            {
                throw new InvalidOperationException("Invalid question count retrieved.");
            }
            return questionCount;
        }
    }

}
