using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.GradeComponent;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GESS.Common.HandleException;

namespace GESS.Service.GradeCompoService
{
    // ThaiNH_Create_UserProfile
    public class CateExamSubService : BaseService<CateExamSubService>, ICateExamSubService
    {
        private readonly IUnitOfWork _unitOfWork;
        public CateExamSubService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<CategoryExamSubject> CreateCateExamSubAsync(CategoryExamSubjectDTO dto)
        {
            // Validate DTO

            var existing = await _unitOfWork.CateExamSubRepository.GetBySubIdAndCateEIdAsync(dto.SubjectId, dto.CategoryExamId);
            if (existing != null)
            {
                throw new ConflictException("Đầu điểm cho danh mục kỳ thi và môn học này đã tồn tại.");
            }

            var categoryExamSubjects = await _unitOfWork.CateExamSubRepository.GetAllAsync(); // Await trước
            var totalGradeComponent = categoryExamSubjects.Sum(ces => ces.GradeComponent);
            if (totalGradeComponent + dto.GradeComponent > 100)
            {
                throw new BusinessRuleException("Tổng thành phần điểm cho các bài thi không được vượt quá 100%.");
            }

            var entity = new CategoryExamSubject
            {
                CategoryExamId = dto.CategoryExamId,
                SubjectId = dto.SubjectId,
                GradeComponent = dto.GradeComponent
            };

            try
            {
                await _unitOfWork.CateExamSubRepository.AddCateExamSubAsync(entity);
                await _unitOfWork.SaveChangesAsync();
                return entity;
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Lỗi khi lưu dữ liệu: " + ex.InnerException?.Message);
            }
        }

        public async Task DeleteCateExamSubAsync(int subjectId, int categoryExamId)
        {
            // Kiểm tra xem có trong bài thi exam nào chưa, nếu rồi thì không cho xóa còn chưa thì xóa bth

            // getById
            var entity = await _unitOfWork.CateExamSubRepository.GetBySubIdAndCateEIdAsync(subjectId , categoryExamId);

            entity.IsDelete = true;
            try
            {
                //await _unitOfWork.CateExamSubRepository.DeleteCateExamSubAsync(entity); // neu xoa data
                await _unitOfWork.CateExamSubRepository.UpdateCateExamSubAsync(entity);

                await _unitOfWork.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new BadRequestException("Lỗi khi xóa dữ liệu: " + ex.InnerException?.Message);
            }
        }

        public async Task DeleteAllCESBySubjectIdAsync(int subjectId)
        {

                // Lấy tất cả các bản ghi CategoryExamSubject liên quan đến SubjectId
                var categoryExamSubjects = await _unitOfWork.CateExamSubRepository.GetAllCateExamSubBySubIdAsync(subjectId);
                var entities = categoryExamSubjects.ToList();
                // Đổi trạng thái IsActive của tất cả các bản ghi
                foreach (var entity in entities)
                {
                    entity.IsDelete = true; 
                }
            try
            {
                //await _unitOfWork.CateExamSubRepository.UpdateAllCESBySubIdAsync(entities);
                // Lưu thay đổi vào database
                await _unitOfWork.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new BadRequestException("Lỗi khi cập nhật trạng thái: " + ex.InnerException?.Message);
            }
        }

        // ThaiNH_add_UpdateMark&UserProfile_Begin
        public async Task<IEnumerable<CategoryExamSubjectDTO>> GetAllCateExamSubBySubIdAsync(int subjectId)
           => await _unitOfWork.CateExamSubRepository.GetAllCateExamSubBySubIdAsync(subjectId);
        // ThaiNH_add_UpdateMark&UserProfile_End




        public async Task UpdateCateExamSubAsync(int subjectId , int categoryExamId, CategoryExamSubjectDTO dto)
        {
            // Validate input
            var entity = await _unitOfWork.CateExamSubRepository.GetBySubIdAndCateEIdAsync(subjectId , categoryExamId);

            // Check business rule (example: GradeComponent sum for a CategoryExam <= 100)
            var categoryExamSubjects = await _unitOfWork.CateExamSubRepository.GetAllCateExamSubBySubIdAsync(subjectId); // Await trước
            var totalGradeComponent = categoryExamSubjects
                .Sum(ces => ces.GradeComponent);
            if (totalGradeComponent + dto.GradeComponent > 100)
            {
                throw new BusinessRuleException("Tổng thành phần điểm cho các bài thi không được vượt quá 100%.");
            }

            // Update entity
            entity.CategoryExamId = dto.CategoryExamId;
            entity.GradeComponent = dto.GradeComponent;

            await _unitOfWork.CateExamSubRepository.DeleteCateExamSubAsync(entity);
            // Tạo entity mới với DTO
            var newEntity = new CategoryExamSubject
            {
                SubjectId = subjectId,
                CategoryExamId = dto.CategoryExamId,
                GradeComponent = dto.GradeComponent,
            };
            try
            {
                await _unitOfWork.CateExamSubRepository.UpdateCateExamSubAsync(entity);
                await _unitOfWork.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new BadRequestException("Lỗi khi cập nhật dữ liệu: " + ex.InnerException?.Message);
            }
        }
    }
}
