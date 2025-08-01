using Gess.Repository.Infrastructures;
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
    public class GradeScheduleService : BaseService<ExamSlotRoom>, IGradeScheduleService
    {
        private readonly IUnitOfWork _unitOfWork;
        public GradeScheduleService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }


        //
        public async Task<bool> MarkPracticeExamGradedAsync(int pracExamId)
        {
            var practiceExam = await _unitOfWork.GradeScheduleRepository.GetByIdAsync(pracExamId);
            if (practiceExam == null) return false;
            practiceExam.IsGraded = 1;
            return await _unitOfWork.GradeScheduleRepository.UpdateAsync(practiceExam);
        }


        //
        public async Task<bool> MarkStudentExamGradeMidTermdAsync(int examId, Guid studentId, double totalScore)
        {
            return await _unitOfWork.GradeScheduleRepository.MarkStudentExamGradedMidTermAsync(examId, studentId, Common.PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM, totalScore);
        }


        //
        public async Task<bool> MarkExamSlotRoomGradedAsync(int examSlotRoomId)
        {
            return await _unitOfWork.GradeScheduleRepository.MarkExamSlotRoomGradedAsync(examSlotRoomId);
        }



        //
        public async Task<bool> MarkStudentExamGradedAsync(int examSlotRoomId, Guid studentId, double totalScore)
        {
            return await _unitOfWork.GradeScheduleRepository.MarkStudentExamGradedAsync(examSlotRoomId, studentId, Common.PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM, totalScore);
        }



        //
        public async Task<int?> GetPracExamIdByHistoryIdAsync(Guid pracExamHistoryId)
        {
            return await _unitOfWork.GradeScheduleRepository.GetPracExamIdByHistoryIdAsync(pracExamHistoryId);
        }

        //
        public async Task<object?> GetStudentExamDetailAsync(int examSlotRoomId, Guid studentId)
        {
            var pracExamHistory = await GetSubmissionOfStudentInExamNeedGradeAsync(Guid.Empty, examSlotRoomId, studentId);
            if (pracExamHistory == null) return null;

            var pracExamId = await GetPracExamIdByHistoryIdAsync(pracExamHistory.PracExamHistoryId);

            return new
            {
                StudentId = pracExamHistory.StudentId,
                StudentCode = pracExamHistory.StudentCode,
                FullName = pracExamHistory.FullName,
                PracExamId = pracExamId,
                Questions = pracExamHistory.QuestionPracExamDTO.Select(q => new
                {
                    QuestionId = q.PracticeQuestionId,
                    Content = q.QuestionContent,
                    GradingCriteria = q.GradingCriteria,
                    StudentAnswer = q.Answer,
                    Score = q.GradedScore,
                    PracticeExamHistoryId = pracExamHistory.PracExamHistoryId,
                    PracticeQuestionId = q.PracticeQuestionId,
                    MaxScore = q.Score

                }).ToList()
            };
        }




        public async Task<bool> ChangeStatusGraded(Guid teacherId, int examId)
        {
            bool result = await _unitOfWork.GradeScheduleRepository.ChangeStatusGraded(teacherId, examId);
            if (result)
            {
                return true;
            }
            else
            {
                return false;
            }
        }



        //------------------
        public async Task<ExamSlotRoomGradingInfoDTO> GetGradingInfoByExamSlotRoomIdAsync(int examSlotRoomId)
        {
            // Chỉ gọi repository, không xử lý logic ở service
            return await _unitOfWork.GradeScheduleRepository.GetGradingInfoByExamSlotRoomIdAsync(examSlotRoomId);
        }




        public async Task<int> CountExamNeedGradeByTeacherIdAsync(Guid teacherId, int? subjectId, int? statusExam, int? semesterId, int? year, int? pagesze, int? pageindex)
        {
            return await _unitOfWork.GradeScheduleRepository.CountExamNeedGradeByTeacherIdAsync(
                teacherId, subjectId, statusExam, semesterId, year, pagesze, pageindex);

        }

        public async Task<IEnumerable<ExamNeedGrade>> GetExamNeedGradeByTeacherIdAsync(Guid teacherId, int? subjectId, int? statusExam, int? semesterId, int? year, int? pagesze, int? pageindex)
        {
            var exams = await _unitOfWork.GradeScheduleRepository.GetExamNeedGradeByTeacherIdAsync(teacherId, subjectId, statusExam, semesterId, year, pagesze, pageindex);
            if (exams == null || !exams.Any())
            {
                return Enumerable.Empty<ExamNeedGrade>();
            }
            return exams;
        }

        public async Task<IEnumerable<ExamNeedGradeMidTerm>> GetExamNeedGradeByTeacherIdMidTermAsync(Guid teacherId, int classID, int semesterId, int year, int pagesze, int pageindex)
        {
            var exams = await _unitOfWork.GradeScheduleRepository.GetExamNeedGradeByTeacherIdMidTermAsync(teacherId, classID, semesterId, year, pagesze, pageindex);
            if (exams == null || !exams.Any())
            {
                return Enumerable.Empty<ExamNeedGradeMidTerm>();
            }
            return exams;
        }

        public async Task<IEnumerable<StudentGradeDTO>> GetStudentsInExamNeedGradeAsync(Guid teacherId, int examId)
        {
            var students = await _unitOfWork.GradeScheduleRepository.GetStudentsInExamNeedGradeAsync(teacherId, examId);
            if (students == null || !students.Any())
            {
                return Enumerable.Empty<StudentGradeDTO>();
            }
            return students;
        }

        public async Task<IEnumerable<StudentGradeDTO>> GetStudentsInExamNeedGradeMidTermAsync(Guid teacherId, int classID, int ExamType, int examId)
        {
            var students = await _unitOfWork.GradeScheduleRepository.GetStudentsInExamNeedGradeMidTermAsync(teacherId, classID, ExamType,examId);
            if (students == null || !students.Any())
            {
                return Enumerable.Empty<StudentGradeDTO>();
            }
            return students;
        }

        public async Task<StudentSubmission> GetSubmissionOfStudentInExamNeedGradeAsync(Guid teacherId, int examId, Guid studentId)
        {
            var submissions = await _unitOfWork.GradeScheduleRepository.GetSubmissionOfStudentInExamNeedGradeAsync(teacherId, examId, studentId);
            if (submissions == null)
            {
                return null;
            }
            return submissions;
        }

        public async Task<StudentSubmission> GetSubmissionOfStudentInExamNeedGradeMidTerm(Guid teacherId, int examId, Guid studentId)
        {
            var submissions = await _unitOfWork.GradeScheduleRepository.GetSubmissionOfStudentInExamNeedGradeMidTerm(teacherId, examId, studentId);
            if (submissions == null)
            {
                return null;
            }
            return submissions;
        }
        public async Task<StudentSubmissionMultiExam> GetSubmissionOfStudentInExamNeedGradeMidTermMulti(Guid teacherId, int examId, Guid studentId)
        {
            var submissions = await _unitOfWork.GradeScheduleRepository.GetSubmissionOfStudentInExamNeedGradeMidTermMulti(teacherId, examId, studentId);
            if (submissions == null)
            {
                return null;
            }
            return submissions;
        }

        public async Task<bool> GradeSubmission(Guid teacherId, int examId, Guid studentId, QuestionPracExamGradeDTO questionPracExamDTO)
        {
           var result = await _unitOfWork.GradeScheduleRepository.GradeSubmission(teacherId, examId, studentId, questionPracExamDTO);
            if (result)
            {
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
            else
            {
                return false;
            }
        }
    }

}
