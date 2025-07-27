using Gess.Repository.Infrastructures;
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
    public class AssignGradeCreateExamService : BaseService<SubjectTeacher>, IAssignGradeCreateExamService
    {
        private readonly IUnitOfWork _unitOfWork;
        public AssignGradeCreateExamService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> AssignRoleCreateExam(Guid teacherId, int subjectId)
        {
            return await _unitOfWork.AssignGradeCreateExamRepository.AssignRoleCreateExam(teacherId, subjectId);
        }

        public async Task<bool> AssignRoleGradeExam(Guid teacherId, int subjectId)
        {
            return await _unitOfWork.AssignGradeCreateExamRepository.AssignRoleGradeExam(teacherId, subjectId);
        }

        public async Task<IEnumerable<SubjectDTO>> GetAllSubjectsByTeacherId(Guid teacherId)
        {
            var subjects = await _unitOfWork.AssignGradeCreateExamRepository.GetAllSubjectsByTeacherId(teacherId);
            if (subjects == null || !subjects.Any())
            {
                return Enumerable.Empty<SubjectDTO>();
            }
            return subjects;
        }

        public async Task<IEnumerable<TeacherResponse>> GetAllTeacherHaveSubject(int subjectId)
        {
            var teachers = await _unitOfWork.AssignGradeCreateExamRepository.GetAllTeacherHaveSubject(subjectId);
            if (teachers == null || !teachers.Any())
            {
                return Enumerable.Empty<TeacherResponse>();
            }
            return teachers;
        }
    }

}
