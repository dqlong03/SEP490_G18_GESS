using GESS.Entity.Entities;
using GESS.Model.Subject;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.multipleQuestion
{
    public interface IMultipleQuestionService : IBaseService<MultiQuestion>
    {
        Task<int> GetQuestionCount(int? chapterId, int? categoryId, int? levelId, bool? isPublic, string? createdBy);
    }
}
