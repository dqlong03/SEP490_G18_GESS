using GESS.Entity.Entities;
using GESS.Model.Chapter;
using GESS.Model.ExamSlotRoomDTO;
using GESS.Model.MultiExamHistories;
using GESS.Model.Student;
using GESS.Model.Subject;
using GESS.Model.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.assignGradeCreateExam
{
    public interface IAssignGradeCreateExamService : IBaseService<SubjectTeacher>
    {
        Task<bool> AssignRoleCreateExam(Guid teacherId, int subjectId);
        Task <bool> AssignRoleGradeExam(Guid teacherId, int subjectId);
        Task<IEnumerable<SubjectDTO>> GetAllSubjectsByTeacherId(Guid teacherId);
        Task<IEnumerable<TeacherResponse>> GetAllTeacherHaveSubject(int subjectId);
    }
}
