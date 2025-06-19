using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Category;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface ICategoryExamRepository : IBaseRepository<CategoryExam>
    {
        Task<IEnumerable<CategoryExam>> GetAllAsync(int subjectId);

        // ThaiNH_add_UpdateMark&UserProfile_Begin
        Task<IEnumerable<CategoryExam>> GetAllAsync();
        // ThaiNH_add_UpdateMark&UserProfile_End

    }
}
