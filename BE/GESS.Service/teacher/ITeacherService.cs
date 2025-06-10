using GESS.Model.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.teacher
{
    public interface ITeacherService
    {
        Task<TeacherResponse> GetTeacherByIdAsync(Guid teacherId);
        Task<List<TeacherResponse>> GetAllTeachersAsync();
        Task<TeacherResponse> AddTeacherAsync(TeacherCreationRequest request);
        Task<TeacherResponse> UpdateTeacherAsync(Guid teacherId, TeacherUpdateRequest request);
        Task DeleteTeacherAsync(Guid teacherId);
        Task SendResetPasswordEmailAsync(Guid userId, string resetPasswordUrlBase);

    }

}
