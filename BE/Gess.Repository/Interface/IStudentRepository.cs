using GESS.Model.Student;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IStudentRepository
    {
        Task<StudentResponse> AddStudentAsync(Guid id, StudentCreationRequest request);
        Task<int> CountPageAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize);
        Task<List<StudentResponse>> GetAllStudentsAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageNumber, int pageSize);
        Task<StudentResponse> GetStudentByIdAsync(Guid studentId);
        Task<List<StudentResponse>> SearchStudentsAsync(string keyword);
        Task<StudentResponse> UpdateStudentAsync(Guid studentId, StudentUpdateRequest request);
    }
}
