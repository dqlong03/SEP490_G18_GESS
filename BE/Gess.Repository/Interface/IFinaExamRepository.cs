using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Chapter;
using GESS.Model.ExamSlotRoomDTO;
using GESS.Model.GradeSchedule;
using GESS.Model.MultipleExam;
using GESS.Model.PracticeExam;
using GESS.Model.PracticeExamPaper;
using GESS.Model.PracticeTestQuestions;
using GESS.Model.QuestionPracExam;
using GESS.Model.Student;
using GESS.Model.Subject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IFinaExamRepository
    {
        Task<int> CountPageNumberFinalExam(int subjectId, int? semesterId, int? year, int type, string? textSearch, int pageSize);
        Task<FinalMultipleExamCreateDTO> CreateFinalMultipleExamAsync(FinalMultipleExamCreateDTO multipleExamCreateDto);
        Task<FinalPracticeExamCreateDTO> CreateFinalPracExamAsync(FinalPracticeExamCreateDTO finalPracExamCreateDto);
        Task<List<ChapterInClassDTO>> GetAllChapterBySubjectId(int subjectId);
        Task<List<FinalExamListDTO>> GetAllFinalExam(int subjectId, int? semesterId, int? year, int type, string? textSearch, int pageNumber, int pageSize);
        Task<List<ExamPaperDTO>> GetAllFinalExamPaper(int subjectId, int semesterId, int year);
        Task<List<ExamPaperDTO>> GetAllFinalExamPaper(int subjectId, int semesterId);
        Task<List<SubjectDTO>> GetAllMajorByTeacherId(Guid teacherId);
        Task<PracticeExamPaperDetailDTO> ViewFinalExamPaperDetail(int examPaperId);
        Task<MultipleExamResponseDTO> ViewMultiFinalExamDetail(int examId);
        Task<PracticeExamResponeDTO> ViewPracFinalExamDetail(int examId);
    }

}
