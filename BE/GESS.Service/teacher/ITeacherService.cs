using GESS.Model.Teacher;
using Microsoft.AspNetCore.Http;
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
        Task<int> CountPageAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize);
        Task<List<TeacherResponse>> GetAllTeachersAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageNumber, int pageSize);
        Task<TeacherResponse> UpdateTeacherAsync(Guid teacherId, TeacherUpdateRequest request);
        Task DeleteTeacherAsync(Guid teacherId);
        Task SendResetPasswordEmailAsync(Guid userId, string resetPasswordUrlBase);
        Task<List<TeacherResponse>> SearchTeachersAsync(string keyword);
        Task <string>RestoreTeacher(Guid teacherId);
        Task<string> AddTeacherListAsync(List<TeacherCreationRequest> list);
    }

}
