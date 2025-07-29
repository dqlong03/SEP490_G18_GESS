using DocumentFormat.OpenXml.Wordprocessing;
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
        bool AddTeacherToSubject(Guid teacherId, int subjectId);
        bool AssignRoleCreateExam(Guid teacherId, int subjectId);
        bool AssignRoleGradeExam(Guid teacherId, int subjectId);
        int CountPageNumberTeacherHaveSubject(int subjectId, string? textSearch, int pageSize);
        bool DeleteTeacherFromSubject(Guid teacherId, int subjectId);
        Task<IEnumerable<SubjectDTO>> GetAllSubjectsByTeacherId(Guid teacherId, string? textSearch = null);
        Task<IEnumerable<TeacherResponse>> GetAllTeacherHaveSubject(int subjectId,string? textSearch, int pageNumber, int pageSize);
        Task<IEnumerable<TeacherResponse>> GetAllTeacherInMajor(Guid teacherId);
    }
}
