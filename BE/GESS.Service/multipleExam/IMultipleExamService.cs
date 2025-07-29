using GESS.Entity.Entities;
using GESS.Model.Major;
using GESS.Model.MultipleExam;
using GESS.Model.Subject;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.multipleExam
{
    public interface IMultipleExamService : IBaseService<MultiExam>
    {
        Task<MultipleExamCreateDTO> CreateMultipleExamAsync(MultipleExamCreateDTO multipleExamCreateDto);
        Task<ExamInfoResponseDTO> CheckExamNameAndCodeMEAsync(CheckExamRequestDTO request);
        Task<UpdateMultiExamProgressResponseDTO> UpdateProgressAsync(UpdateMultiExamProgressDTO dto);
        Task<SubmitExamResponseDTO> SubmitExamAsync(UpdateMultiExamProgressDTO dto);
        Task<List<SubjectListDTO>> GetSubjectsByTeacherIdAsync(Guid teacherId);


        //
        Task<MultipleExamUpdateDTO> GetMultipleExamForUpdateAsync(int multiExamId);
        Task<bool> UpdateMultipleExamAsync(MultipleExamUpdateDTO dto);

    }
}
