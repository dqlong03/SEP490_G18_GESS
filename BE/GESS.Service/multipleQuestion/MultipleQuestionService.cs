using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.MultipleQuestionDTO;
using GESS.Model.Subject;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.multipleQuestion
{
    public class MultipleQuestionService : BaseService<MultiQuestion>, IMultipleQuestionService
    {
        private readonly IUnitOfWork _unitOfWork;
        public MultipleQuestionService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<MultipleQuestionListDTO>> GetAllMultipleQuestionsAsync()
        {
            return await _unitOfWork.MultipleQuestionRepository.GetAllMultipleQuestionsAsync();
        }

        public async Task<int> GetQuestionCount(int? chapterId, int? categoryId, int? levelId, bool? isPublic, Guid? createdBy)
        {
            var questionCount = await _unitOfWork.MultipleQuestionRepository.GetQuestionCountAsync(chapterId, categoryId, levelId, isPublic, createdBy);
            if (questionCount < 0)
            {
                throw new InvalidOperationException("Invalid question count retrieved.");
            }
            return questionCount;
        }

        public async Task<MultipleQuestionCreateDTO> MultipleQuestionCreateAsync(MultipleQuestionCreateDTO dto)
        {
            var multiple = new MultiQuestion
            {
                Content = dto.Content,
                UrlImg = dto.UrlImg,
                IsActive = dto.IsActive,
                CreatedBy = dto.CreatedBy,
                IsPublic = dto.IsPublic,
                ChapterId = dto.ChapterId,
                CategoryExamId = dto.CategoryExamId,
                LevelQuestionId = dto.LevelQuestionId,
                SemesterId = dto.SemesterId,
                CreateAt = DateTime.UtcNow 
            };

            await _unitOfWork.MultipleQuestionRepository.CreateAsync(multiple);
            await _unitOfWork.SaveChangesAsync();

            if (dto.Answers != null && dto.Answers.Any())
            {
                foreach (var answerDto in dto.Answers)
                {
                    var answer = new MultiAnswer
                    {
                        AnswerContent = answerDto.Content,
                        IsCorrect = answerDto.IsCorrect,
                        MultiQuestionId = multiple.MultiQuestionId
                    };
                    await _unitOfWork.MultipleAnswerRepository.CreateAsync(answer);
                }
                await _unitOfWork.SaveChangesAsync();
            }
            return dto;
        }

        public async Task<List<QuestionMultiExamSimpleDTO>> GetAllQuestionMultiExamByMultiExamIdAsync(int multiExamId)
        {
            return await _unitOfWork.MultipleQuestionRepository.GetAllQuestionMultiExamByMultiExamIdAsync(multiExamId);
        }

        public async Task<int> GetFinalQuestionCount(int? chapterId, int? levelId, int? semesterId)
        {
            var questionCount = await _unitOfWork.MultipleQuestionRepository.GetFinalQuestionCount(chapterId, levelId, semesterId);
            if (questionCount < 0)
            {
                throw new InvalidOperationException("Invalid question count retrieved.");
            }
            return questionCount;
        }
    }

}
