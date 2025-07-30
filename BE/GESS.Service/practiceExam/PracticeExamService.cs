using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.MultipleExam;
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
    public class PracticeExamService : BaseService<PracticeExam>, IPracticeExamService
    {
        private readonly IUnitOfWork _unitOfWork;
        public PracticeExamService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        //
        public async Task<bool> UpdatePracticeExamAsync(PracticeExamUpdateDTO2 dto)
        {
            return await _unitOfWork.PracticeExamRepository.UpdatePracticeExamAsync(dto);
        }


        //
        public async Task<PracticeExamUpdateDTO2> GetPracticeExamForUpdateAsync(int pracExamId)
        {
            return await _unitOfWork.PracticeExamRepository.GetPracticeExamForUpdateAsync(pracExamId);
        }

        public async Task<PracticeExamCreateDTO> CreatePracticeExamAsync(PracticeExamCreateDTO practiceExamCreateDto)
        {
            var practiceExam = await _unitOfWork.PracticeExamRepository.CreatePracticeExamAsync(practiceExamCreateDto);
            if (practiceExam == null)
            {
                throw new Exception("Lỗi khi tạo bài kiểm tra tự luận.");
            }
            return practiceExamCreateDto;
        }
        public async Task<PracticeExamInfoResponseDTO> CheckExamNameAndCodePEAsync(CheckPracticeExamRequestDTO request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request), "Dữ liệu đầu vào không được để trống!");

            // Fix for CS0472: ExamId is of type int, which cannot be null. Adjusted the condition to check for default value instead.
            if (request.ExamId == default || string.IsNullOrWhiteSpace(request.Code))
                throw new ArgumentException("Tên bài thi và mã code không được để trống!");

            if (request.StudentId == Guid.Empty)
                throw new ArgumentException("StudentId không hợp lệ!");

            return await _unitOfWork.PracticeExamRepository.CheckExamNameAndCodePEAsync(request);
        }

        public async Task<List<QuestionOrderDTO>> GetQuestionAndAnswerByPracExamId(int pracExamId)
        {
            return await _unitOfWork.PracticeExamRepository.GetQuestionAndAnswerByPracExamId(pracExamId);
        }

        public async Task<List<PracticeAnswerOfQuestionDTO>> GetPracticeAnswerOfQuestion(int pracExamId)
        {
            return await _unitOfWork.PracticeExamRepository.GetPracticeAnswerOfQuestion(pracExamId);
        }
        public async Task UpdatePEEach5minutesAsync(List<UpdatePracticeExamAnswerDTO> answers)
        {
            if (answers == null || !answers.Any())
                throw new ArgumentException("Danh sách câu trả lời không được để trống!");

            await _unitOfWork.PracticeExamRepository.UpdatePEEach5minutesAsync(answers);
        }
        public async Task<SubmitPracticeExamResponseDTO> SubmitPracticeExamAsync(SubmitPracticeExamRequest dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto), "Dữ liệu đầu vào không được để trống!");

            if (dto.PracExamHistoryId == Guid.Empty)
                throw new ArgumentException("PracExamHistoryId không hợp lệ!");

            if (dto.Answers == null || !dto.Answers.Any())
                throw new ArgumentException("Danh sách câu trả lời không được để trống!");

            return await _unitOfWork.PracticeExamRepository.SubmitPracticeExamAsync(dto);
        }
    }

}
