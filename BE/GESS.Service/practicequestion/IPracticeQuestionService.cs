using GESS.Entity.Entities;
using GESS.Model.PracticeQuestionDTO;
using GESS.Model.Subject;
using GESS.Model.TrainingProgram;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.practicequestion
{
    public interface IPracticeQuestionService : IBaseService<PracticeQuestion>
    {
        Task<(IEnumerable<QuestionBankListDTO> Data, int TotalCount)> GetAllQuestionsAsync(
        int? majorId, int? subjectId, int? chapterId, bool? isPublic, int? levelId, string? questionType, int pageNumber, int pageSize, Guid? teacherId);

        Task<(IEnumerable<PracticeQuestionExamPaperDTO> Data, int TotalCount)> GetPracticeQuestionsAsync(
        int classId, string? content, int? levelId, int? chapterId, int page, int pageSize);
        Task<IEnumerable<PracticeQuestionLitsDTO>> GetAllPracticeQuestionsAsync(int chapterId);
        Task<IEnumerable<PracticeQuestionCreateNoChapterDTO>> PracticeQuestionsCreateAsync(int chapterId, List<PracticeQuestionCreateNoChapterDTO> dtos);
        Task<IEnumerable< PracticeQuestionReadExcel>> PracticeQuestionReadExcel(IFormFile file);

        Task<IEnumerable<SubjectDTO>> GetSubjectsByCategoryExamIdAsync(int categoryExamId);

        Task<bool> DeleteQuestionByTypeAsync(int questionId, int type);
    }
}
