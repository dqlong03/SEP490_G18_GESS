using GESS.Entity.Entities;
using GESS.Model.PracticeExam;
using GESS.Model.Subject;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.practiceExam
{
    public interface IPracticeExamService : IBaseService<PracticeExam>
    {
        Task <PracticeExamCreateDTO> CreatePracticeExamAsync(PracticeExamCreateDTO practiceExamCreateDto);
        Task<PracticeExamInfoResponseDTO> CheckExamNameAndCodePEAsync(CheckPracticeExamRequestDTO request);
        Task<List<QuestionOrderDTO>> GetQuestionAndAnswerByPracExamId(int pracExamId);
        Task<List<PracticeAnswerOfQuestionDTO>> GetPracticeAnswerOfQuestion(int pracExamId);
        Task UpdatePEEach5minutesAsync(List<UpdatePracticeExamAnswerDTO> answers);
        Task<SubmitPracticeExamResponseDTO> SubmitPracticeExamAsync(SubmitPracticeExamRequest dto);
        Task<PracticeExamUpdateDTO2> GetPracticeExamForUpdateAsync(int pracExamId);

        Task<bool> UpdatePracticeExamAsync(PracticeExamUpdateDTO2 dto);

    }
}
