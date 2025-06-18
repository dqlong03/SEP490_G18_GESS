using GESS.Entity.Entities;
using GESS.Model.PracticeExamPaper;
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
        Task<List<ExamPaperListDTO>> GetAllExamPaperListAsync(
            string? searchName = null,
            int? subjectId = null,
            int? semesterId = null,
            int? categoryExamId = null,
            int page = 1,
            int pageSize = 10
        );
        Task<int> CountPageAsync(string? name = null, int? subjectId = null, int? semesterId = null, int? categoryExamId = null, int pageSize = 5);
    }

}
