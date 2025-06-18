using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
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
        Task<List<ExamPaperListDTO>> GetAllExamPaperListAsync(
            string? searchName = null,
            int? subjectId = null,
            int? semesterId = null,
            int? categoryExamId = null,
            int page = 1,
            int pageSize = 5
        );
        Task<int> CountPageAsync(string? name = null, int? subjectId = null, int? semesterId = null, int? categoryExamId = null, int pageSize = 5);
    }
}
