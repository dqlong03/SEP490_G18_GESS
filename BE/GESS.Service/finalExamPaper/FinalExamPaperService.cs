using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Chapter;
using GESS.Model.ExamSlotRoomDTO;
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
using Org.BouncyCastle.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.finalExamPaper
{
    public class FinalExamPaperService : BaseService<PracticeExamPaper>, IFinalExamPaperService
    {
        private readonly IUnitOfWork _unitOfWork;
        public FinalExamPaperService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<int> CountPageNumberFinalExamQuestion(int? semesterId, int? chapterId, int? levelId, string? textSearch, int pageSize)
        {
            var totalCount = await _unitOfWork.FinalExamPaperRepository.CountPageNumberFinalExamQuestion(semesterId, chapterId, levelId, textSearch, pageSize);
            if (totalCount < 0)
            {
                throw new InvalidOperationException("Failed to count the number of final exam questions.");
            }
            return totalCount;
        }

        public async Task<FinalPracticeExamPaperCreateRequest> CreateFinalExamPaperAsync(FinalPracticeExamPaperCreateRequest finalExamPaperCreateDto)
        {
            var finalExamPaper = await _unitOfWork.FinalExamPaperRepository.CreateFinalExamPaperAsync(finalExamPaperCreateDto);
            if (finalExamPaper == null)
            {
                throw new InvalidOperationException("Failed to create final exam paper.");
            }
            return finalExamPaper;
        }

        public async Task<List<PracticeQuestionExamPaperDTO>> GetFinalPracticeQuestion(int? semesterId, int? chapterId, int? levelId, string? textSearch, int pageNumber, int pageSize)
        {
            var questions = await _unitOfWork.FinalExamPaperRepository.GetFinalPracticeQuestion(semesterId, chapterId, levelId, textSearch, pageNumber, pageSize);
            if (questions == null || !questions.Any())
            {
                return new List<PracticeQuestionExamPaperDTO>();
            }
            return questions;
        }
    }

}
