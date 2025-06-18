using GESS.Entity.Entities;
using GESS.Model.PracticeQuestionDTO;
using GESS.Model.Subject;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.practicequestion
{
    public interface IPracticeQuestionService : IBaseService<PracticeQuestion>
    {
        Task<IEnumerable<PracticeQuestionLitsDTO>> GetAllPracticeQuestionsAsync();
        Task<PracticeQuestionCreateDTO> PracticeQuestionCreateAsync(PracticeQuestionCreateDTO practiceQuestionCreateDTO);
    }
}
