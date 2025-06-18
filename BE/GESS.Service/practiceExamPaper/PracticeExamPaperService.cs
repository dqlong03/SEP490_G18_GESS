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

namespace GESS.Service.practiceExamPaper
{
    public class PracticeExamPaperService : BaseService<PracticeExamPaper>, IPracticeExamPaperService
    {
        private readonly IUnitOfWork _unitOfWork;
        public PracticeExamPaperService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
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
