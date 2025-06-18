using GESS.Entity.Entities;
using GESS.Model.LevelQuestionDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.levelquestion
{
    public interface ILevelQuestionService : IBaseService<LevelQuestionService>
    {
        Task<IEnumerable<LevelQuestionDTO>> GetAllLevelQuestionsAsync();
    }
}
