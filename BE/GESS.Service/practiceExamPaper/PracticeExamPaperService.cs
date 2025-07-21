using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.PracticeExamPaper;
using GESS.Model.Subject;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GESS.Repository.Interface;

namespace GESS.Service.practiceExamPaper
{
    public class PracticeExamPaperService : BaseService<PracticeExamPaper>, IPracticeExamPaperService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PracticeExamPaperService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<PracticeExamPaperCreateResponse> CreateExamPaperAsync(PracticeExamPaperCreateRequest request)
        {
            // Gọi xuống repository để xử lý logic tạo đề thi
            return await _unitOfWork.PracticeExamPaperRepository.CreateExamPaperAsync(request);
        }

        public async Task<List<ExamPaperListDTO>> GetAllExamPaperListAsync(
            string? searchName = null,
            int? subjectId = null,
            int? semesterId = null,
            int? categoryExamId = null,
            int page = 1,
            int pageSize = 10
        )
        {
            var result = await _unitOfWork.PracticeExamPaperRepository.GetAllExamPaperListAsync(
                searchName, subjectId, semesterId, categoryExamId, page, pageSize
            );

            if (result == null || !result.Any())
            {
                throw new Exception("Không có kết quả.");
            }

            return result;
        }
        public async Task<int> CountPageAsync(string? name = null, int? subjectId = null, int? semesterId = null, int? categoryExamId = null, int pageSize = 5)
        {
            return await _unitOfWork.PracticeExamPaperRepository.CountPageAsync(name, subjectId, semesterId, categoryExamId, pageSize);
        }
        public async Task<IEnumerable<PracticeExamPaperDTO>> GetAllPracticeExamPapers(int? subjectId, int? categoryId, Guid? teacherId, int? semesterId, string? year)
        {
            var practiceExamPapers = await _unitOfWork.PracticeExamPaperRepository.GetAllPracticeExamPapersAsync(subjectId, categoryId, teacherId, semesterId,year);
            if (practiceExamPapers == null || !practiceExamPapers.Any())
            {
                return Enumerable.Empty<PracticeExamPaperDTO>();
            }
            var practiceExamPaperDtos = practiceExamPapers.Select(paper => new PracticeExamPaperDTO
            {
                PracExamPaperId = paper.PracExamPaperId,
                PracExamPaperName = paper.PracExamPaperName,
                Semester = paper.Semester?.SemesterName ?? "Không xác định",
                Year = paper.CreateAt.Year.ToString()
            });
            return practiceExamPaperDtos;
        }

        public async Task<PracticeExamPaperCreate> CreateExampaperByTeacherAsync(PracticeExamPaperCreate practiceExamPaperCreate, Guid teacherId)
        {
            if (practiceExamPaperCreate == null)
            {
                throw new ArgumentNullException(nameof(practiceExamPaperCreate));
            }

            var examPaper = new PracticeExamPaper
            {
                PracExamPaperName = practiceExamPaperCreate.PracExamPaperName,
                NumberQuestion = practiceExamPaperCreate.QuestionScores?.Count ?? 0, 
                CreateAt = DateTime.UtcNow,
                Status = practiceExamPaperCreate.Status,
                TeacherId = teacherId,
                CategoryExamId = practiceExamPaperCreate.CategoryExamId,
                SubjectId = practiceExamPaperCreate.SubjectId,
                SemesterId = practiceExamPaperCreate.SemesterId,
                PracticeTestQuestions = new List<PracticeTestQuestion>()
            };

            await _unitOfWork.PracticeExamPaperRepository.CreateAsync(examPaper);
            await _unitOfWork.SaveChangesAsync(); 

            if (practiceExamPaperCreate.QuestionScores == null || !practiceExamPaperCreate.QuestionScores.Any())
            {
                throw new ArgumentException("Danh sách câu hỏi không được rỗng.", nameof(practiceExamPaperCreate.QuestionScores));
            }

            await _unitOfWork.SaveChangesAsync(); 

            var testQuestions = practiceExamPaperCreate.QuestionScores.Select((item, index) => new PracticeTestQuestion
            {
                PracExamPaperId = examPaper.PracExamPaperId,
                PracticeQuestionId = item.PracticeQuestionId,
                QuestionOrder = index + 1,
                Score = item.Score
            }).ToList();

            await _unitOfWork.PracticeExamPaperRepository.CreateTestQuestionsAsync(testQuestions);
            await _unitOfWork.SaveChangesAsync(); // Lần 3

            return practiceExamPaperCreate;
        }
        public async Task<List<ListPracticeQuestion>> GetPracticeQuestionsByTeacherAsync(Guid teacherId)
        {
            return await _unitOfWork.PracticeExamPaperRepository.GetPracticeQuestionsAsync(teacherId);
        }
        public async Task<List<ListPracticeQuestion>> GetPublicPracticeQuestionsAsync(string? search = null, int? levelQuestionId = null)
        {
            return await _unitOfWork.PracticeExamPaperRepository.GetPublicPracticeQuestionsAsync(search, levelQuestionId);
        }

        public async Task<List<ListPracticeQuestion>> GetPrivatePracticeQuestionsAsync(Guid teacherId, string? search = null, int? levelQuestionId = null)
        {
            return await _unitOfWork.PracticeExamPaperRepository.GetPrivatePracticeQuestionsAsync(teacherId, search, levelQuestionId);
        }
        public async Task<PracticeExamPaperDetailDTO> GetExamPaperDetailAsync(int examPaperId)
        {
            return await _unitOfWork.PracticeExamPaperRepository.GetExamPaperDetailAsync(examPaperId);
        }


    }
}

   
