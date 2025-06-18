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
using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.PracticeExamPaper;
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
        public async Task<IEnumerable<PracticeExamPaperDTO>> GetAllPracticeExamPapers(int subjectId, int categoryId, Guid teacherId)
        {
            var practiceExamPapers = await _unitOfWork.PracticeExamPaperRepository.GetAllPracticeExamPapersAsync(subjectId, categoryId, teacherId);
            if (practiceExamPapers == null || !practiceExamPapers.Any())
            {
                return Enumerable.Empty<PracticeExamPaperDTO>();
            }
            var practiceExamPaperDtos = practiceExamPapers.Select(paper => new PracticeExamPaperDTO
            {

            });
            return practiceExamPaperDtos;
        }
    }

}
