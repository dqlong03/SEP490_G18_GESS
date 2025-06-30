using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.ExamSlotRoomDTO;
using GESS.Model.GradeSchedule;
using GESS.Model.PracticeTestQuestions;
using GESS.Model.Student;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IGradeScheduleRepository
    {
        Task<int> CountExamNeedGradeByTeacherIdAsync(Guid teacherId, int subjectId, int statusExam, int semesterId, int year, int pagesze);
        Task<IEnumerable<ExamNeedGrade>> GetExamNeedGradeByTeacherIdAsync(Guid teacherId, int subjectId, int statusExam, int semesterId, int year, int pagesze, int pageindex);
        Task<IEnumerable<StudentGradeDTO>> GetStudentsInExamNeedGradeAsync(Guid teacherId, int examId);
        Task<IEnumerable<StudentSubmission>> GetSubmissionOfStudentInExamNeedGradeAsync(Guid teacherId, int examId, Guid studentId);
    }
}
