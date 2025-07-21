using GESS.Entity.Entities;
using GESS.Model.MultipleQuestionDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.multianswer
{
    public interface IMultiAnswerService : IBaseService<MultiAnswer>
    {
        Task<List<MultiAnswerOfQuestionDTO>> GetAllMultiAnswerOfQuestionAsync(int multiQuestionId);
    }
}
