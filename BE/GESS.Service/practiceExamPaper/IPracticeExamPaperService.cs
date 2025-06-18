using GESS.Entity.Entities;
using GESS.Model.Major;
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
    public interface IPracticeExamPaperService : IBaseService<PracticeExamPaper>
    {
        Task<IEnumerable<PracticeExamPaperDTO>> GetAllPracticeExamPapers(int subjectId, int categoryId, Guid teacherId);
    }
}
