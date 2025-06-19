using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.GradeComponent;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

// ThaiNH_Create_UserProfile
namespace GESS.Repository.Interface
{
    public interface ICateExamSubRepository : IBaseRepository<CategoryExamSubject>
    {
        Task<CategoryExamSubject> GetBySubIdAndCateEIdAsync(int subjectId, int  categoryExamId);
        Task AddCateExamSubAsync(CategoryExamSubject entity);
        Task UpdateCateExamSubAsync(CategoryExamSubject entity);
        Task UpdateAllCESBySubIdAsync(List<CategoryExamSubject> entities);
        Task DeleteCateExamSubAsync(CategoryExamSubject entity);
        Task DeleteCESBySubjectIdAsync(int subjectId);
        // ThaiNH_add_UpdateMark&UserProfile_Begin
        Task<IEnumerable<CategoryExamSubjectDTO>> GetAllCateExamSubBySubIdAsync(int subjectId);
        // ThaiNH_add_UpdateMark&UserProfile_End
    }
}
