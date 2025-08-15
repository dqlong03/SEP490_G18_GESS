using Gess.Repository.Infrastructures;
using GESS.Model.Exam;
using GESS.Repository.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.exam
{
    public class ExamService : IExamService
    {
        private readonly IUnitOfWork _unitOfWork;
        public ExamService(IUnitOfWork unitOfWork) 
        {
            _unitOfWork = unitOfWork;
        }


        public async Task<(List<ExamListResponse> Data, int TotalCount)> GetTeacherExamsAsync(
            Guid teacherId,
            int pageNumber,
            int pageSize,
            int? majorId,
            int? semesterId,
           // string? gradeComponent,
            int? subjectId,
            string? examType,
            string? searchName)
        {
            return await _unitOfWork.ExamRepository.GetTeacherExamsAsync(
                teacherId, pageNumber, pageSize, majorId, semesterId, subjectId, examType, searchName
                //, gradeComponent
                );
        }

        public Task<bool> UpdatePracticeExamAsync(PracticeExamUpdateDTO dto)
             => _unitOfWork.ExamRepository.UpdatePracticeExamAsync(dto);

        public Task<bool> UpdateMultiExamAsync(MultiExamUpdateDTO dto)
               => _unitOfWork.ExamRepository.UpdateMultiExamAsync(dto);

        public async Task<List<ExamListOfStudentResponse>> GetAllMultiExamOfStudentAsync(ExamFilterRequest request)
        {
            return await _unitOfWork.ExamRepository.GetAllMultiExamOfStudentAsync(request);
        }

        public async Task<List<ExamListOfStudentResponse>> GetAllPracExamOfStudentAsync(ExamFilterRequest request)
        {
            return await _unitOfWork.ExamRepository.GetAllPracExamOfStudentAsync(request);
        }

        public async Task<ExamStatusCheckListResponseDTO> CheckExamStatusAsync(ExamStatusCheckRequestDTO request)
        {
            return await _unitOfWork.ExamRepository.CheckExamStatusAsync(request);
        }
    }

}
