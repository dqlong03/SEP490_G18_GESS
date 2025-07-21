using GESS.Entity.Entities;
using GESS.Model.Category;
using GESS.Model.Major;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.categoryExam
{
    public interface ICategoryExamService : IBaseService<CategoryExam>
    {
        Task<IEnumerable<CategoryExamDTO>> GetCategoriesBySubjectId(int  majorId);

        // ThaiNH_add_UpdateMark&UserProfile_Begin
        Task<IEnumerable<CategoryExamDTO>> GetAllCategoryExamsAsync();
        // ThaiNH_add_UpdateMark&UserProfile_End


    }
}
