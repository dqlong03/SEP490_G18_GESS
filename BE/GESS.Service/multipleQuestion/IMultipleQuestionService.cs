using GESS.Entity.Entities;
using GESS.Model.MultipleExam;
using GESS.Model.MultipleQuestionDTO;
using GESS.Model.PracticeQuestionDTO;
using GESS.Model.Subject;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.multipleQuestion
{
    public interface IMultipleQuestionService : IBaseService<MultiQuestion>
    {
        Task<IEnumerable<MultipleQuestionListDTO>> GetAllMultipleQuestionsAsync();
        Task<int> GetQuestionCount(int? chapterId, int? categoryId, int? levelId, bool? isPublic, Guid? createdBy);
        Task<MultipleQuestionCreateDTO> MultipleQuestionCreateAsync(MultipleQuestionCreateDTO multipleQuestionCreateDTO);
        Task<List<QuestionMultiExamSimpleDTO>> GetAllQuestionMultiExamByMultiExamIdAsync(int multiExamId);
        Task<int> GetFinalQuestionCount(int? chapterId, int? levelId, int? semesterId);
    }
}
