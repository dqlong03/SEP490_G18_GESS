using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface ITeacherRepository : IBaseRepository<Teacher>
    {
        Task<TeacherResponse> GetTeacherByIdAsync(Guid teacherId);
        Task<List<TeacherResponse>> GetAllTeachersAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageNumber, int pageSize);
        Task<TeacherResponse> UpdateTeacherAsync(Guid teacherId, TeacherUpdateRequest teacher);
        Task DeleteTeacherAsync(Guid teacherId);
        Task<List<TeacherResponse>> SearchTeachersAsync(string keyword);
        Task<int> CountPageAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize);
        Task<string> RestoreTeacher(Guid teacherId);
        Task<string> AddTeacherListAsync(List<TeacherCreationRequest> list);
    }

}
