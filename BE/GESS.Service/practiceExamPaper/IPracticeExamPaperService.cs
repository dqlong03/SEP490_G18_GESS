using GESS.Entity.Entities;
using GESS.Model.Major;
using GESS.Model.PracticeExamPaper;
using GESS.Model.Subject;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Gess.Repository.Infrastructures;

namespace GESS.Service.practiceExamPaper
{
    public interface IPracticeExamPaperService : IBaseService<PracticeExamPaper>
    {
        Task<PracticeExamPaperCreateResponse> CreateExamPaperAsync(PracticeExamPaperCreateRequest request);

        Task<List<ExamPaperListDTO>> GetAllExamPaperListAsync(
            string? searchName = null,
            int? subjectId = null,
            int? semesterId = null,
            int? categoryExamId = null,
            int page = 1,
            int pageSize = 10
        );
        Task<int> CountPageAsync(string? name = null, int? subjectId = null, int? semesterId = null, int? categoryExamId = null, int pageSize = 5);
        Task<IEnumerable<PracticeExamPaperDTO>> GetAllPracticeExamPapers(int? subjectId, int? categoryId, Guid? teacherId, int? semesterId, string? year);
        Task<PracticeExamPaperCreate> CreateExampaperByTeacherAsync(PracticeExamPaperCreate practiceExamPaperCreate, Guid teacherId);
        Task<List<ListPracticeQuestion>> GetPracticeQuestionsByTeacherAsync(Guid teacherId);
        Task<List<ListPracticeQuestion>> GetPublicPracticeQuestionsAsync(string? search = null, int? levelQuestionId = null);
        Task<List<ListPracticeQuestion>> GetPrivatePracticeQuestionsAsync(Guid teacherId, string? search = null, int? levelQuestionId = null);
        Task<PracticeExamPaperDetailDTO> GetExamPaperDetailAsync(int examPaperId);

    }

}
