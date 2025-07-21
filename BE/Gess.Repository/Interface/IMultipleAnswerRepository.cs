using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.MultipleQuestionDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IMultipleAnswerRepository : IBaseRepository<MultiAnswer>
    {
        Task<List<MultiAnswerOfQuestionDTO>> GetAllMultiAnswerOfQuestionAsync(int multiQuestionId);
    }
}
