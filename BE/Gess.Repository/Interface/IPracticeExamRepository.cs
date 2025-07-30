using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.MultipleExam;
using GESS.Model.PracticeExam;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IPracticeExamRepository : IBaseRepository<PracticeExam>
    {
        Task <PracticeExam> CreatePracticeExamAsync(PracticeExamCreateDTO practiceExamCreateDto);
        Task<PracticeExamInfoResponseDTO> CheckExamNameAndCodePEAsync(CheckPracticeExamRequestDTO request);
        Task<List<QuestionOrderDTO>> GetQuestionAndAnswerByPracExamId(int pracExamId);
        Task<List<PracticeAnswerOfQuestionDTO>> GetPracticeAnswerOfQuestion(int pracExamId);
        Task UpdatePEEach5minutesAsync(List<UpdatePracticeExamAnswerDTO> answers);
        Task<SubmitPracticeExamResponseDTO> SubmitPracticeExamAsync(SubmitPracticeExamRequest dto);

        Task<PracticeExamUpdateDTO2> GetPracticeExamForUpdateAsync(int pracExamId);
        Task<bool> UpdatePracticeExamAsync(PracticeExamUpdateDTO2 dto);


    }
}
