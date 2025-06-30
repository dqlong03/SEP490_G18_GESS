using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.PracticeQuestionDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IPracticeQuestionsRepository : IBaseRepository<PracticeQuestion>
    {

        Task<(IEnumerable<QuestionBankListDTO> Data, int TotalCount)> GetAllQuestionsAsync(
       int? majorId, int? subjectId, int? chapterId, bool? isPublic, int? levelId, string? questionType, int pageNumber, int pageSize);


        Task<(IEnumerable<PracticeQuestionExamPaperDTO> Data, int TotalCount)> GetPracticeQuestionsAsync(
        int classId, string? content, int? levelId, int? chapterId, int page, int pageSize);

        Task<IEnumerable<PracticeQuestionLitsDTO>> GetAllPracticeQuestionsAsync(int chapterId);
    }
}
