using GESS.Entity.Entities;
using GESS.Model.Chapter;
using GESS.Model.GradeSchedule;
using GESS.Model.MultipleExam;
using GESS.Model.MultipleQuestionDTO;
using GESS.Model.PracticeExam;
using GESS.Model.PracticeExamPaper;
using GESS.Model.PracticeQuestionDTO;
using GESS.Model.PracticeTestQuestions;
using GESS.Model.QuestionPracExam;
using GESS.Model.Student;
using GESS.Model.Subject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static GESS.Model.PracticeExam.PracticeExamCreateDTO;

namespace GESS.Service.finalExamPaper
{
    public interface IFinalExamPaperService : IBaseService<PracticeExamPaper>
    {
        Task <FinalPracticeExamPaperCreateRequest> CreateFinalExamPaperAsync(FinalPracticeExamPaperCreateRequest finalExamPaperCreateDto);
        Task<List<PracticeQuestionExamPaperDTO>> GetFinalPracticeQuestion(int? semesterId, int? chapterId, int? levelId, string? textSearch, int pageNumber, int pageSize);
        Task<int> CountPageNumberFinalExamQuestion(int? semesterId, int? chapterId, int? levelId, string? textSearch, int pageSize);

    }

}
