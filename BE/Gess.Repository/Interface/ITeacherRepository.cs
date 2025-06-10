using GESS.Entity.Entities;
using GESS.Model.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface ITeacherRepository
    {
        Task<TeacherResponse> GetTeacherByIdAsync(Guid teacherId);
        Task<List<TeacherResponse>> GetAllTeachersAsync();
        Task AddTeacherAsync(Guid userId, TeacherCreationRequest request);
        Task<TeacherResponse> UpdateTeacherAsync(Guid teacherId, TeacherUpdateRequest teacher);
        Task DeleteTeacherAsync(Guid teacherId);
    }

}
