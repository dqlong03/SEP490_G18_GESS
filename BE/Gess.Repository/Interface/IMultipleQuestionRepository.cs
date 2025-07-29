using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.MultipleQuestionDTO;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IMultipleQuestionRepository : IBaseRepository<MultiQuestion>
    {
        Task<IEnumerable<MultipleQuestionListDTO>> GetAllMultipleQuestionsAsync();
        Task<int> GetQuestionCountAsync(int? chapterId, int? categoryId, int? levelId, bool? isPublic, Guid? createdBy);
        Task<List<QuestionMultiExamSimpleDTO>> GetAllQuestionMultiExamByMultiExamIdAsync(int multiExamId);
        Task<int> GetFinalQuestionCount(int? chapterId, int? levelId, int? semesterId);
    }
}
