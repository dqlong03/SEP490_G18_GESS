using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.MultipleExam;
using GESS.Model.Subject;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IMultipleExamRepository : IBaseRepository<MultiExam>
    {
        Task <MultiExam>CreateMultipleExamAsync(MultipleExamCreateDTO multipleExamCreateDto);
        Task<ExamInfoResponseDTO> CheckAndPrepareExamAsync(int examId, string code, Guid studentId);
        Task<UpdateMultiExamProgressResponseDTO> UpdateProgressAsync(UpdateMultiExamProgressDTO dto);
        Task<SubmitExamResponseDTO> SubmitExamAsync(UpdateMultiExamProgressDTO dto);

        Task<List<SubjectListDTO>> GetSubjectsByTeacherIdAsync(Guid teacherId);

        //
        Task<MultipleExamUpdateDTO> GetMultipleExamForUpdateAsync(int multiExamId);
        Task<bool> UpdateMultipleExamAsync(MultipleExamUpdateDTO dto);

    }
}
