using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.PracticeQuestionDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IPracticeQuestionsRepository : IBaseRepository<PracticeQuestion>
    {
        Task<IEnumerable<PracticeQuestionLitsDTO>> GetAllPracticeQuestionsAsync();
    }
}
