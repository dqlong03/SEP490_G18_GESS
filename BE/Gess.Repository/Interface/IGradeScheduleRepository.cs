using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.ExamSlotRoomDTO;
using GESS.Model.GradeSchedule;
using GESS.Model.PracticeTestQuestions;
using GESS.Model.QuestionPracExam;
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
        Task<bool> ChangeStatusGraded(Guid teacherId, int examId);
        Task<int> CountExamNeedGradeByTeacherIdAsync(Guid teacherId, int? subjectId, int? statusExam, int? semesterId, int? year, int? pagesze, int? pageindex);
        Task<IEnumerable<ExamNeedGrade>> GetExamNeedGradeByTeacherIdAsync(Guid teacherId, int? subjectId, int? statusExam, int? semesterId, int? year, int? pagesze, int? pageindex);

        //Task<int> CountExamNeedGradeByTeacherIdAsync(Guid teacherId, int subjectId, int statusExam, int semesterId, int year, int pagesze);
        //Task<IEnumerable<ExamNeedGrade>> GetExamNeedGradeByTeacherIdAsync(Guid teacherId, int subjectId, int statusExam, int semesterId, int year, int pagesze, int pageindex);
        Task<IEnumerable<ExamNeedGradeMidTerm>> GetExamNeedGradeByTeacherIdMidTermAsync(Guid teacherId, int classID, int semesterId, int year, int pagesze, int pageindex);

        Task<IEnumerable<StudentGradeDTO>> GetStudentsInExamNeedGradeAsync(Guid teacherId, int examId);
        Task<IEnumerable<StudentGradeDTO>> GetStudentsInExamNeedGradeMidTermAsync(Guid teacherId, int classID, int ExamType, int examId);
        Task<StudentSubmission> GetSubmissionOfStudentInExamNeedGradeAsync(Guid teacherId, int examId, Guid studentId);
        Task<StudentSubmission> GetSubmissionOfStudentInExamNeedGradeMidTerm(Guid teacherId, int examId, Guid studentId);
        Task<StudentSubmissionMultiExam> GetSubmissionOfStudentInExamNeedGradeMidTermMulti(Guid teacherId, int examId, Guid studentId);
        Task<bool> GradeSubmission(Guid teacherId, int examId, Guid studentId, QuestionPracExamGradeDTO questionPracExamDTO);
       

        //
        Task<ExamSlotRoomGradingInfoDTO> GetGradingInfoByExamSlotRoomIdAsync(int examSlotRoomId);

        //
        Task<int?> GetPracExamIdByHistoryIdAsync(Guid pracExamHistoryId);

        //
        Task<bool> MarkStudentExamGradedAsync(int examSlotRoomId, Guid studentId, string gradedStatus, double totalScore);

        //
        Task<bool> MarkExamSlotRoomGradedAsync(int examSlotRoomId);

        //
        Task<bool> MarkStudentExamGradedMidTermAsync(int examId, Guid studentId, string gradedStatus, double totalScore);

        //
        Task<PracticeExam> GetByIdAsync(int pracExamId);
        Task<bool> UpdateAsync(PracticeExam practiceExam);



    }
}
