using GESS.Entity.Entities;
using GESS.Model.Chapter;
using GESS.Model.Class;
using GESS.Model.Student;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service
{
    public interface IClassService : IBaseService<Class>
    {

        //Tuan
        Task<ClassDetailResponseDTO?> GetClassDetailAsync(int classId);
        //

        Task<ClassCreateDTO> CreateClassAsync(ClassCreateDTO classCreateDto);
        Task<IEnumerable<ClassListDTO>> GetAllClassAsync(string? name = null, int? subjectId = null, int? semesterId = null, int pageNumber = 1, int pageSize = 5);
        Task<IEnumerable<ClassListDTO>> GetAllClassByTeacherIdAsync(Guid teacherId, string? name = null, int? subjectId = null, int? semesterId = null, int pageNumber = 1, int pageSize = 5);

        Task<ClassUpdateDTO> UpdateClassAsync(int ClassId, ClassUpdateDTO classUpdateDto);
        Task<int> CountPageAsync(string? name = null, int? subjectId = null, int? semesterId = null, int pageSize = 5);
        Task<int> CountPageByTeacherAsync(Guid teacherId, string? name = null, int? subjectId = null, int? semesterId = null, int pageSize = 5);
        Task AddStudentsToClassAsync(AddStudentsToClassRequest request);
    }
}
