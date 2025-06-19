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
        // ThaiNH_add_UpdateMark&UserProfile_Begin
        Task<IEnumerable<CategoryExamSubjectDTO>> GetAllCateExamSubBySubIdAsync(int subjectId);
        Task UpdateCateExamSubAsync(int subjectId, int categoryExamId, CategoryExamSubjectDTO dto);
        // ThaiNH_add_UpdateMark&UserProfile_End
        Task DeleteCateExamSubAsync(int subjectId, int categoryExamId);
        Task DeleteAllCESBySubjectIdAsync(int subjectId);
    }
}
