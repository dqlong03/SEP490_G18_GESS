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

        public async Task<IEnumerable<StudentGradeDTO>> GetStudentsInExamNeedGradeAsync(Guid teacherId, int examId)
        {
            var students = await _unitOfWork.GradeScheduleRepository.GetStudentsInExamNeedGradeAsync(teacherId, examId);
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

        public async Task<bool> GradeSubmission(Guid teacherId, int examId, Guid studentId, QuestionPracExamDTO questionPracExamDTO)
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
