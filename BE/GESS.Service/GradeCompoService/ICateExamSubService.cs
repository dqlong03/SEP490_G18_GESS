using GESS.Entity.Entities;
using GESS.Model.GradeComponent;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.GradeCompoService
{
    // ThaiNH_Create_UserProfile
    public interface ICateExamSubService : IBaseService<CateExamSubService>
    {
        Task<CategoryExamSubject> CreateCateExamSubAsync(CategoryExamSubjectDTO dto);
        Task<IEnumerable<CategoryExamSubject>> GetAllCateExamSubBySubIdAsync(int subjectId);
        Task UpdateCateExamSubAsync(int categoryExamId, int subjectId, CategoryExamSubjectDTO dto);
        Task DeleteCateExamSubAsync(int subjectId, int categoryExamId);
        Task DeleteAllCESBySubjectIdAsync(int subjectId);
    }
}
