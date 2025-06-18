using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.MultipleExam;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IPracticeExamPaperRepository : IBaseRepository<PracticeExamPaper>
    {
        Task<IEnumerable<PracticeExamPaper>> GetAllPracticeExamPapersAsync(int subjectId, int categoryId, Guid teacherId);
    }
}
