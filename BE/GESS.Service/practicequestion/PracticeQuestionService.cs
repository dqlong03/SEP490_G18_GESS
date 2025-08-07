using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.PracticeQuestionDTO;
using GESS.Model.Subject;
using GESS.Model.TrainingProgram;
using Microsoft.AspNetCore.Http;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.practicequestion
{
    public class PracticeQuestionService : BaseService<PracticeQuestion>, IPracticeQuestionService
    {
        private readonly IUnitOfWork _unitOfWork;
        public PracticeQuestionService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }



        // 
        public async Task<bool> DeleteQuestionByTypeAsync(int questionId, int type)
        {
            return await _unitOfWork.PracticeQuestionsRepository.DeleteQuestionByTypeAsync(questionId, type);
        }




        // API lấy danh sách môn học theo CategoryExamId
        // GESS.Service.subject/SubjectService.cs
        public async Task<IEnumerable<SubjectDTO>> GetSubjectsByCategoryExamIdAsync(int categoryExamId)
        {
            return await _unitOfWork.PracticeQuestionsRepository.GetSubjectsByCategoryExamIdAsync(categoryExamId);
        }


        // API lấy danh sách câu hỏi trắc nghiệm và tự luận
        public async Task<(IEnumerable<QuestionBankListDTO> Data, int TotalCount)> GetAllQuestionsAsync(
        int? majorId, int? subjectId, int? chapterId, bool? isPublic, int? levelId, string? questionType, int pageNumber, int pageSize, Guid? teacherId)
        {
            return await _unitOfWork.PracticeQuestionsRepository.GetAllQuestionsAsync(majorId, subjectId, chapterId, isPublic, levelId, questionType, pageNumber, pageSize,teacherId);
        }

        public async Task<(IEnumerable<PracticeQuestionExamPaperDTO> Data, int TotalCount)> GetPracticeQuestionsAsync(
            int classId, string? content, int? levelId, int? chapterId, int page, int pageSize)
        {
            return await _unitOfWork.PracticeQuestionsRepository.GetPracticeQuestionsAsync(classId, content, levelId, chapterId, page, pageSize);
        }

        //--------------------------------------    





        public async Task<IEnumerable<PracticeQuestionLitsDTO>> GetAllPracticeQuestionsAsync(int chapterId)
        {
            return await _unitOfWork.PracticeQuestionsRepository.GetAllPracticeQuestionsAsync(chapterId);
        }
        public async Task<IEnumerable<PracticeQuestionCreateNoChapterDTO>> PracticeQuestionsCreateAsync(
        int chapterId,
        List<PracticeQuestionCreateNoChapterDTO> dtos)
        {
            foreach (var dto in dtos)
            {
                var practiceQuestion = new PracticeQuestion
                {
                    Content = dto.Content,
                    UrlImg = dto.UrlImg,
                    IsActive = dto.IsActive,
                    CreatedBy = dto.CreatedBy,
                    IsPublic = dto.IsPublic,
                    CategoryExamId = dto.CategoryExamId,
                    LevelQuestionId = dto.LevelQuestionId,
                    SemesterId = dto.SemesterId,
                    ChapterId = chapterId,
                    CreateAt = DateTime.UtcNow
                };

                await _unitOfWork.PracticeQuestionsRepository.CreateAsync(practiceQuestion);
                await _unitOfWork.SaveChangesAsync(); 

                if (!string.IsNullOrWhiteSpace(dto.AnswerContent))
                {
                    var answer = new PracticeAnswer
                    {
                        AnswerContent = dto.AnswerContent,
                        PracticeQuestionId = practiceQuestion.PracticeQuestionId,
                        GradingCriteria = dto.Criteria,
                    };

                    await _unitOfWork.PracticeAnswersRepository.CreateAsync(answer);
                    await _unitOfWork.SaveChangesAsync();
                }
            }

            return dtos;
        }



        public async Task<IEnumerable<PracticeQuestionReadExcel>> PracticeQuestionReadExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return null;

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                stream.Position = 0;

                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets[0]; 
                    if (worksheet == null || worksheet.Dimension == null)
                        return null;

                    var rowCount = worksheet.Dimension.Rows;
                    var results = new List<PracticeQuestionReadExcel>();

                    var levelMapping = new Dictionary<string, int>
                {
                { "Dễ", 1 },
                { "Trung bình", 2 },
                { "Khó", 3 }
                   };

                    for (int row = 3; row <= rowCount; row++)
                    {
                        if (!string.IsNullOrWhiteSpace(worksheet.Cells[row, 1].Text))
                        {
                            var item = new PracticeQuestionReadExcel
                            {
                                Content = worksheet.Cells[row, 1].Text,
                                UrlImg = worksheet.Cells[row, 2].Text,
                                LevelQuestion = levelMapping.TryGetValue(worksheet.Cells[row, 3].Text.Trim(), out int level) ? level : 0,
                                AnswerContent = worksheet.Cells[row, 4].Text
                            };
                            results.Add(item);
                        }
                    }

                    return await Task.FromResult(results.Any() ? results : null);
                }
            }
        }


    }

}
