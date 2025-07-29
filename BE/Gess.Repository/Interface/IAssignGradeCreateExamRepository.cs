using GESS.Model.Subject;
using GESS.Model.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IAssignGradeCreateExamRepository
    {
        bool AddTeacherToSubject(Guid teacherId, int subjectId);
        bool AssignRoleCreateExam(Guid teacherId, int subjectId);
        bool AssignRoleGradeExam(Guid teacherId, int subjectId);
        bool DeleteTeacherFromSubject(Guid teacherId, int subjectId);
        Task<IEnumerable<SubjectDTO>> GetAllSubjectsByTeacherId(Guid teacherId, string? textSearch = null);
        Task<IEnumerable<TeacherResponse>> GetAllTeacherHaveSubject(int subjectId, string? textSearch = null, int pageNumber = 1, int pageSize = 10);
        Task<IEnumerable<TeacherResponse>> GetAllTeacherInMajor(Guid teacherId);
    }
}
