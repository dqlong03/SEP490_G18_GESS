using GESS.Model.Exam;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IExamRepository 
    {
        Task<(List<ExamListResponse> Data, int TotalCount)> GetTeacherExamsAsync(
            Guid teacherId,
            int pageNumber,
            int pageSize,
            int? majorId,
            int? semesterId,
            int? subjectId,
           // string? gradeComponent,
            string? examType,
            string? searchName);

        Task<bool> UpdatePracticeExamAsync(PracticeExamUpdateDTO dto);
        Task<bool> UpdateMultiExamAsync(MultiExamUpdateDTO dto);
        Task<List<ExamListOfStudentResponse>> GetAllMultiExamOfStudentAsync(ExamFilterRequest request);
        Task<List<ExamListOfStudentResponse>> GetAllPracExamOfStudentAsync(ExamFilterRequest request);
        Task<ExamStatusCheckListResponseDTO> CheckExamStatusAsync(ExamStatusCheckRequestDTO request);
    }

}
