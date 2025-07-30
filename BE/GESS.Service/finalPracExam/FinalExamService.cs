using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Chapter;
using GESS.Model.ExamSlotRoomDTO;
using GESS.Model.GradeSchedule;
using GESS.Model.MultipleExam;
using GESS.Model.MultipleQuestionDTO;
using GESS.Model.PracticeExam;
using GESS.Model.PracticeExamPaper;
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

namespace GESS.Service.finalPracExam
{
    public class FinalExamService : BaseService<PracticeExam>, IFinalExamService
    {
        private readonly IUnitOfWork _unitOfWork;
        public FinalExamService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<int> CountPageNumberFinalExam(int subjectId, int? semesterId, int? year, int type, string? textSearch, int pageSize)
        {
            var totalExams = await _unitOfWork.FinalPracExamRepository.CountPageNumberFinalExam(subjectId, semesterId, year, type, textSearch, pageSize);
            if (totalExams <= 0)
            {
                return 0; // No exams found
            }
            return totalExams;
        }

        public async Task<FinalMultipleExamCreateDTO> CreateFinalMultipleExamAsync(FinalMultipleExamCreateDTO multipleExamCreateDto)
        {
            var finalMultiExam = await _unitOfWork.FinalPracExamRepository.CreateFinalMultipleExamAsync(multipleExamCreateDto);
            if (finalMultiExam == null)
            {
                throw new InvalidOperationException("Failed to create final multiple exam.");
            }
            return finalMultiExam;
        }

        public async Task<FinalPracticeExamCreateDTO> CreateFinalPracExamAsync(FinalPracticeExamCreateDTO finalPracExamCreateDto)
        {
            var finalPracExam = await _unitOfWork.FinalPracExamRepository.CreateFinalPracExamAsync(finalPracExamCreateDto);
            if (finalPracExam == null)
            {
                throw new InvalidOperationException("Failed to create final practice exam.");
            }
            return finalPracExam;
        }

        public async Task<List<ChapterInClassDTO>> GetAllChapterBySubjectId(int subjectId)
        {
            var chapters = await _unitOfWork.FinalPracExamRepository.GetAllChapterBySubjectId(subjectId);
            if (chapters == null || !chapters.Any())
            {
                return new List<ChapterInClassDTO>();
            }
            return chapters;
        }

        public async Task<List<FinalExamListDTO>> GetAllFinalExam(int subjectId, int? semesterId, int? year, int type, string? textSearch, int pageNumber, int pageSize)
        {
            var finalExams = await _unitOfWork.FinalPracExamRepository.GetAllFinalExam(subjectId, semesterId, year, type, textSearch, pageNumber, pageSize);
            if (finalExams == null || !finalExams.Any())
            {
                return new List<FinalExamListDTO>();
            }
            return finalExams;
        }

        public async Task<List<ExamPaperDTO>> GetAllFinalExamPaper(int subjectId, int semesterId)
        {
            var examPapers = await _unitOfWork.FinalPracExamRepository.GetAllFinalExamPaper(subjectId, semesterId);
            if (examPapers == null || !examPapers.Any())
            {
                return new List<ExamPaperDTO>();
            }
            return examPapers;
        }

        public async Task<List<ExamPaperDTO>> GetAllFinalExamPaper(int subjectId, int semesterId, int year)
        {
            var examPapers = await _unitOfWork.FinalPracExamRepository.GetAllFinalExamPaper(subjectId, semesterId, year);
            if (examPapers == null || !examPapers.Any())
            {
                return new List<ExamPaperDTO>();
            }
            return examPapers;
        }

        public async Task<List<SubjectDTO>> GetAllMajorByTeacherId(Guid teacherId)
        {
            var subjects = await _unitOfWork.FinalPracExamRepository.GetAllMajorByTeacherId(teacherId);
            if (subjects == null || !subjects.Any())
            {
                return new List<SubjectDTO>();
            }
            return subjects;
        }

        public async Task<PracticeExamPaperDetailDTO> ViewFinalExamPaperDetail(int examPaperId)
        {
            var examPaperDetail = await _unitOfWork.FinalPracExamRepository.ViewFinalExamPaperDetail(examPaperId);
            if (examPaperDetail == null)
            {
                throw new KeyNotFoundException($"No exam paper found with ID {examPaperId}.");
            }
            return examPaperDetail;
        }

        public async Task<MultipleExamResponseDTO> ViewMultiFinalExamDetail(int examId)
        {
            var examDetail = await _unitOfWork.FinalPracExamRepository.ViewMultiFinalExamDetail(examId);
            if (examDetail == null)
            {
                throw new KeyNotFoundException($"No multiple exam found with ID {examId}.");
            }
            return examDetail;
        }

        public async Task<PracticeExamResponeDTO> ViewPracFinalExamDetail(int examId)
        {
            var examDetail = await _unitOfWork.FinalPracExamRepository.ViewPracFinalExamDetail(examId);
            if (examDetail == null)
            {
                throw new KeyNotFoundException(
                    $"No practice exam found with ID {examId}.");
            }
            return examDetail;
        }
    }

}
