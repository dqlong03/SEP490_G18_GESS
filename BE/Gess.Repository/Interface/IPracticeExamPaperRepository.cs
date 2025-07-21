using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.MultipleExam;
using GESS.Model.TrainingProgram;
using GESS.Model.PracticeExamPaper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace GESS.Repository.Interface
{
    public interface IPracticeExamPaperRepository : IBaseRepository<PracticeExamPaper>
    {

        Task<PracticeExamPaperCreateResponse> CreateExamPaperAsync(PracticeExamPaperCreateRequest request);

        Task<List<ExamPaperListDTO>> GetAllExamPaperListAsync(
            string? searchName = null,
            int? subjectId = null,
            int? semesterId = null,
            int? categoryExamId = null,
            int page = 1,
            int pageSize = 5
        );
        Task<int> CountPageAsync(string? name = null, int? subjectId = null, int? semesterId = null, int? categoryExamId = null, int pageSize = 5);
        Task<IEnumerable<PracticeExamPaper>> GetAllPracticeExamPapersAsync(int? subjectId, int? categoryId, Guid? teacherId, int? semesterId, string? year);
        Task<PracticeExamPaper> CreateWithQuestionsAsync(PracticeExamPaper examPaper, List<PracticeQuestion> questions, List<PracticeTestQuestion> testQuestions);
        Task<PracticeExamPaper> CreateAsync(PracticeExamPaper entity);
        Task<List<PracticeTestQuestion>> CreateTestQuestionsAsync(List<PracticeTestQuestion> testQuestions);
        Task<List<ListPracticeQuestion>> GetPracticeQuestionsAsync(Guid teacherId);
        Task<List<ListPracticeQuestion>> GetPublicPracticeQuestionsAsync(string? search = null, int? levelQuestionId = null);
        Task<List<ListPracticeQuestion>> GetPrivatePracticeQuestionsAsync(Guid teacherId, string? search = null, int? levelQuestionId = null);
        Task<PracticeExamPaperDetailDTO> GetExamPaperDetailAsync(int examPaperId);



    }
}
