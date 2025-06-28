using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Class;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IClassRepository : IBaseRepository<Class>
    {

        Task<ClassDetailResponseDTO?> GetClassDetailAsync(int classId);

        Task<IEnumerable<Class>> GetAllClassesAsync();
        Task<Class> GetByIdAsync(int classId);
     
        Task<bool> ClassExistsAsync(string className);
        Task<IEnumerable<ClassListDTO>> GetAllClassAsync(string? name = null, int? subjectId = null, int? semesterId = null, int pageNumber = 1, int pageSize = 5);
        Task<int> CountStudentsInClassAsync(int classId);
        Task<int> CountPageAsync(string? name = null, int? subjectId = null, int? semesterId = null, int pageSize = 5);
        Task<IEnumerable<ClassListDTO>> GetAllClassByTeacherIdAsync(Guid teacherId, string? name = null, int? subjectId = null, int? semesterId = null, int pageNumber = 1, int pageSize = 5);
        Task<int> CountPageByTeacherAsync(Guid teacherId, string? name = null, int? subjectId = null, int? semesterId = null, int pageSize = 5);
        Task<bool> CheckIfStudentInClassAsync(int classId, Guid studentId);
    }
}
