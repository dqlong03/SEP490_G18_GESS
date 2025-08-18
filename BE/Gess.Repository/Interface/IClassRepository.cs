using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Chapter;
using GESS.Model.Class;
using GESS.Model.GradeComponent;
using GESS.Model.Subject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IClassRepository : IBaseRepository<Class>
    {
        Task<int?> GetSemesterIdByClassIdAsync(int classId);
        Task<int?> GetSubjectIdByClassIdAsync(int classId);
        Task<IEnumerable<StudentInClassDTO>> GetStudentsByClassIdAsync(int classId);
        Task<IEnumerable<GradeComponentDTO>> GetGradeComponentsByClassIdAsync(int classId);
        Task<IEnumerable<ChapterInClassDTO>> GetChaptersByClassIdAsync(int classId);
        Task<ClassDetailResponseDTO?> GetClassDetailAsync(int classId);

        Task<IEnumerable<Class>> GetAllClassesAsync();
        Task<Class> GetByIdAsync(int classId);
     
        Task<bool> ClassExistsAsync(string className);
        Task<IEnumerable<ClassListDTO>> GetAllClassAsync(string? name = null, int? subjectId = null, int? semesterId = null, int pageNumber = 1, int pageSize = 5);
        Task<int> CountStudentsInClassAsync(int classId);
        Task<int> CountPageAsync(string? name = null, int? subjectId = null, int? semesterId = null, int pageSize = 5);
        Task<IEnumerable<ClassListDTO>> GetAllClassByTeacherIdAsync(Guid teacherId, string? name = null, int? subjectId = null, int? semesterId = null, int pageNumber = 1, int pageSize = 5, int? year = null);
        Task<int> CountPageByTeacherAsync(Guid teacherId, string? name = null, int? subjectId = null, int? semesterId = null, int pageSize = 5, int? year = null);
        Task<bool> CheckIfStudentInClassAsync(int classId, Guid studentId);
        Task<IEnumerable<StudentExamScoreDTO>> GetStudentScoresByExamAsync(int examId, int examType);
        Task<IEnumerable<SubjectListDTO>> GetSubjectsByTeacherIdAsync(Guid teacherId);

    }
}
