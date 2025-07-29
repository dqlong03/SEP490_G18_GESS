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

        public bool AddTeacherToSubject(Guid teacherId, int subjectId)
        {
            bool isAdded = _unitOfWork.AssignGradeCreateExamRepository.AddTeacherToSubject(teacherId, subjectId);
            if (isAdded)
            {
                return true;
            }
            return false;
        }

        public bool AssignRoleCreateExam(Guid teacherId, int subjectId)
        {
            return _unitOfWork.AssignGradeCreateExamRepository.AssignRoleCreateExam(teacherId, subjectId);
        }

        public bool AssignRoleGradeExam(Guid teacherId, int subjectId)
        {
            return _unitOfWork.AssignGradeCreateExamRepository.AssignRoleGradeExam(teacherId, subjectId);
        }

        public int CountPageNumberTeacherHaveSubject(int subjectId, string? textSearch, int pageSize)
        {
            var totalCount = _unitOfWork.AssignGradeCreateExamRepository.CountPageNumberTeacherHaveSubject(subjectId, textSearch, pageSize);
            if (totalCount <= 0)
            {
                return 0; // No teachers found
            }
            return totalCount;
        }

        public bool DeleteTeacherFromSubject(Guid teacherId, int subjectId)
        {
            return _unitOfWork.AssignGradeCreateExamRepository.DeleteTeacherFromSubject(teacherId, subjectId);
        }

        public async Task<IEnumerable<SubjectDTO>> GetAllSubjectsByTeacherId(Guid teacherId, string? textSearch = null)
        {
            var subjects = await _unitOfWork.AssignGradeCreateExamRepository.GetAllSubjectsByTeacherId(teacherId,textSearch);
            if (subjects == null || !subjects.Any())
            {
                return Enumerable.Empty<SubjectDTO>();
            }
            return subjects;
        }

        public async Task<IEnumerable<TeacherResponse>> GetAllTeacherHaveSubject(int subjectId, string? textSearch = null, int pageNumber = 1, int pageSize = 10)
        {
            var teachers = await _unitOfWork.AssignGradeCreateExamRepository.GetAllTeacherHaveSubject(subjectId, textSearch, pageNumber, pageSize);
            if (teachers == null || !teachers.Any())
            {
                return Enumerable.Empty<TeacherResponse>();
            }
            return teachers;
        }

        public async Task<IEnumerable<TeacherResponse>> GetAllTeacherInMajor(Guid teacherId)
        {
           var teachers = await _unitOfWork.AssignGradeCreateExamRepository.GetAllTeacherInMajor(teacherId);
            if (teachers == null || !teachers.Any())
            {
                return Enumerable.Empty<TeacherResponse>();
            }
            return teachers;
        }
    }

}
