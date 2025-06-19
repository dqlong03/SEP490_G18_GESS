using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Category;
using GESS.Model.Major;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.categoryExam
{
    public class CategoryExamService : BaseService<CategoryExam>, ICategoryExamService
    {
        private readonly IUnitOfWork _unitOfWork;
        public CategoryExamService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<CategoryExamDTO>> GetCategoriesBySubjectId(int subjectId)
        {
            var categoryExams = await _unitOfWork.CategoryExamRepository.GetAllAsync(subjectId);
            return categoryExams.Select(categoryExam => new CategoryExamDTO
            {
                CategoryExamId = categoryExam.CategoryExamId,
                CategoryExamName = categoryExam.CategoryExamName,
            }).ToList();
        }


        // ThaiNH_add_UpdateMark&UserProfile_Begin

        public async Task<IEnumerable<CategoryExamDTO>> GetAllCategoryExamsAsync()
        {
            var categoryExams = await _unitOfWork.CategoryExamRepository.GetAllAsync();

            return categoryExams.Select(categoryExam => new CategoryExamDTO
            {
                CategoryExamId = categoryExam.CategoryExamId,
                CategoryExamName = categoryExam.CategoryExamName
            }).ToList();
        }
        // ThaiNH_add_UpdateMark&UserProfile_End

    }

}
