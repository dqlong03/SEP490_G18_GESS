using GESS.Entity.Entities;
using GESS.Model.Exam;
using GESS.Model.Student;
using GESS.Model.Subject;
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

        Task<StudentResponse> AddStudentAsync(StudentCreationRequest request , IFormFile? avatar);
        Task<int> CountPageAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize);
        Task<List<StudentResponse>> GetAllStudentsAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageNumber, int pageSize);
        Task<StudentResponse> GetStudentByIdAsync(Guid studentId);
        Task<List<StudentResponse>> ImportStudentsFromExcelAsync(IFormFile file);
        Task<List<StudentResponse>> SearchStudentsAsync(string keyword);
        Task<StudentResponse> UpdateStudentAsync(Guid studentId, StudentUpdateRequest request, IFormFile? avatar);
        Task<Student> AddStudentAsync(Guid id, StudentCreateDTO student);

        Task<IEnumerable<StudentFileExcel>> StudentFileExcelsAsync(IFormFile file);
        Task<List<AllSubjectBySemesterOfStudentDTOResponse>> GetAllSubjectBySemesterOfStudentAsync(int? semesterId, int? year, Guid studentId);
        Task<List<int>> GetAllYearOfStudentAsync(Guid studentId);

        Task<List<HistoryExamOfStudentDTOResponse>> GetHistoryExamOfStudentBySubIdAsync(int? semesterId, int? year, int subjectId, Guid studentId);
    }
}
