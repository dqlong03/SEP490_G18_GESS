using GESS.Model.PracticeExamPaper;
using GESS.Model.PracticeQuestionDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IFinalExamPaperRepository
    {
        Task <int> CountPageNumberFinalExamQuestion(int? semesterId, int? chapterId, int? levelId, string? textSearch, int pageSize);
        Task<FinalPracticeExamPaperCreateRequest> CreateFinalExamPaperAsync(FinalPracticeExamPaperCreateRequest finalExamPaperCreateDto);
        Task<List<PracticeQuestionExamPaperDTO>> GetFinalPracticeQuestion(int? semesterId, int? chapterId, int? levelId, string? textSearch, int pageNumber, int pageSize);
    }
}
