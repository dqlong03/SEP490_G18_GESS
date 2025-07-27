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
        Task<bool> AssignRoleCreateExam(Guid teacherId, int subjectId);
        Task<bool> AssignRoleGradeExam(Guid teacherId, int subjectId);
        Task<IEnumerable<SubjectDTO>> GetAllSubjectsByTeacherId(Guid teacherId);
        Task<IEnumerable<TeacherResponse>> GetAllTeacherHaveSubject(int subjectId);
    }
}
