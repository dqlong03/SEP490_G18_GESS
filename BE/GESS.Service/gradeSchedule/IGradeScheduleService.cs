using GESS.Entity.Entities;
using GESS.Model.Chapter;
using GESS.Model.ExamSlotRoomDTO;
using GESS.Model.GradeSchedule;
using GESS.Model.PracticeTestQuestions;
using GESS.Model.QuestionPracExam;
using GESS.Model.Student;
using GESS.Model.Subject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.gradeSchedule
{
    public interface IGradeScheduleService : IBaseService<ExamSlotRoom>
    {
        Task <int>CountExamNeedGradeByTeacherIdAsync(Guid teacherId, int? subjectId, int? statusExam, int? semesterId, int? year, int? pagesze, int? pageindex);
        Task<IEnumerable<ExamNeedGrade>> GetExamNeedGradeByTeacherIdAsync(Guid teacherId, int? subjectId, int? statusExam, int? semesterId, int? year, int? pagesze, int? pageindex);
        Task<IEnumerable<StudentGradeDTO>> GetStudentsInExamNeedGradeAsync(Guid teacherId, int examId);
        Task<StudentSubmission> GetSubmissionOfStudentInExamNeedGradeAsync(Guid teacherId, int examId, Guid studentId);
        Task<IEnumerable<ExamNeedGradeMidTerm>> GetExamNeedGradeByTeacherIdMidTermAsync(Guid teacherId, int subjectId, int semesterId, int year, int pagesze, int pageindex);
        Task<bool> GradeSubmission(Guid teacherId, int examId, Guid studentId, QuestionPracExamGradeDTO questionPracExamDTO);
        Task<IEnumerable<StudentGradeDTO>> GetStudentsInExamNeedGradeMidTermAsync(Guid teacherId, int classID, int ExamType, int examId);
        Task<StudentSubmission> GetSubmissionOfStudentInExamNeedGradeMidTerm(Guid teacherId, int examId, Guid studentId);
        Task<StudentSubmissionMultiExam> GetSubmissionOfStudentInExamNeedGradeMidTermMulti(Guid teacherId, int examId, Guid studentId);
        Task<bool> ChangeStatusGraded(Guid teacherId, int examId);

        //
        Task<ExamSlotRoomGradingInfoDTO> GetGradingInfoByExamSlotRoomIdAsync(int examSlotRoomId);

        //
        Task<int?> GetPracExamIdByHistoryIdAsync(Guid pracExamHistoryId);

        // 
        Task<object?> GetStudentExamDetailAsync(int examSlotRoomId, Guid studentId);

        //
        Task<bool> MarkStudentExamGradedAsync(int examSlotRoomId, Guid studentId, double totalScore);

        //
        Task<bool> MarkExamSlotRoomGradedAsync(int examSlotRoomId);

        //
        Task<bool> MarkStudentExamGradeMidTermdAsync(int examId, Guid studentId, double totalScore);

        //
        Task<bool> MarkPracticeExamGradedAsync(int pracExamId);

    }
}
