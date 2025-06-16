using GESS.Entity.Entities;
using GESS.Model.Student;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.student
{
    public interface IStudentService : IBaseService<Student>
    {

        Task<StudentResponse> AddStudentAsync(StudentCreationRequest request);
        Task<int> CountPageAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize);
        Task<List<StudentResponse>> GetAllStudentsAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageNumber, int pageSize);
        Task<StudentResponse> GetStudentByIdAsync(Guid studentId);
        Task<List<StudentResponse>> ImportStudentsFromExcelAsync(IFormFile file);
        Task<List<StudentResponse>> SearchStudentsAsync(string keyword);
        Task<StudentResponse> UpdateStudentAsync(Guid studentId, StudentUpdateRequest request);
        Task<Student> AddStudentAsync(Guid id, StudentCreateDTO student);

        Task<IEnumerable<StudentFileExcel>> StudentFileExcelsAsync(IFormFile file);
    }
}
