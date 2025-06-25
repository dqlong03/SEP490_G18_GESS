using Gess.Repository.Infrastructures;
using GESS.Common.HandleException;
using GESS.Entity.Entities;
using GESS.Model.SemestersDTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace GESS.Service.semesters
{
    public class SemestersService : BaseService<Semester>, ISemestersService
    {
        private readonly IUnitOfWork _unitOfWork;
        public SemestersService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // Lấy danh sách học kỳ hiên tại
        public async Task<IEnumerable<SemesterResponse>> GetCurrentSemestersAsync()
        {
            var currentDate = DateTime.UtcNow;

            // ThaiNH_Modified_ManageSemester&ManageRoom_Begin
            var semesters = await _unitOfWork.SemesterRepository.GetAllChooseSemesterAsync();
            // ThaiNH_Modified_ManageSemester&ManageRoom_End

            return semesters.Select(s => new SemesterResponse
            {
                SemesterId = s.SemesterId,
                SemesterName = s.SemesterName
            });
        }
        public async Task<List<SemesterResponse>> GetSemestersByYearAsync(int? year, Guid userId)
        {
            if (!year.HasValue)
            {
                throw new ArgumentException("Year is required.");
            }

            var semesters = await _unitOfWork.SemesterRepository.GetSemestersByYearAsync(year.Value, userId);
            return semesters;
        }

        public async Task<List<SemesterListDTO>> GetAllCurrentSemestersAsync()
        {
            try
            {
                return await _unitOfWork.SemesterRepository.GetAllChooseSemesterAsync();
            }
            catch (Exception ex)
            {
                throw new BadRequestException("Lỗi khi lấy danh sách học kỳ: " + ex.Message);
            }
        }

        public async Task CreateAsync(SemesterCreateDTO request)
        {
            try
            {
                var existing = await _unitOfWork.SemesterRepository.GetAllEntitiesAsync();


                var existingNames = existing.Select(x => x.SemesterName.ToLower().Trim()).ToHashSet();

                var duplicate = request.SemesterNames
                    .Select(x => x.ToLower().Trim())
                    .FirstOrDefault(x => existingNames.Contains(x));

                if (duplicate != null)
                    throw new ConflictException($"Tên học kỳ '{duplicate}' đã tồn tại.");
                var entities = request.SemesterNames.Select(name => new Semester
                {
                    SemesterName = name,
                    IsActive = true
                    
                }).ToList();
                
                await _unitOfWork.SemesterRepository.AddRangeAsync(entities);
                await _unitOfWork.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Lỗi khi tạo học kỳ: " + ex.InnerException?.Message ?? ex.Message);
            }
        }

        public async Task UpdateAsync(SemesterUpdateDTO request)
        {
            try
            {
                
                var entities = await _unitOfWork.SemesterRepository.GetAllEntitiesAsync();

                // Lấy danh sách tên hiện tại trừ chính entity đang cập nhật
                foreach (var item in request.Semesters)
                {
                    var normalizedName = item.SemesterName.ToLower().Trim();

                    bool isDuplicate = entities.Any(e =>
                        e.SemesterId != item.SemesterId &&
                        e.SemesterName.ToLower().Trim() == normalizedName);

                    if (isDuplicate)
                    {
                        throw new ConflictException($"Tên học kỳ bị trùng trong yêu cầu cập nhật.");
                    }
                }

                        int inputCount = request.Semesters.Count;  
                switch (request.Semesters.Count)
                {
                    case 2:
                        for (int i = inputCount; i < entities.Count; i++)
                        {
                            entities[i].SemesterName = "";
                            entities[i].IsActive = false;
                        }
                        break;
                    case 3:
                        for (int i = inputCount; i < entities.Count; i++)
                        {
                            entities[i].SemesterName = "";
                            entities[i].IsActive = false;
                        }

                        break;

                }
                foreach (var item in request.Semesters)
                    {
                        var entity = entities.FirstOrDefault(e => e.SemesterId == item.SemesterId);
                    
                        if (entity != null)
                        {
                            entity.SemesterName = item.SemesterName;
                        entity.IsActive = true;
                        }
                    }

                await _unitOfWork.SemesterRepository.UpdateRangeAsync(entities);
                await _unitOfWork.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Lỗi khi cập nhật học kỳ: " + ex.InnerException?.Message ?? ex.Message);
            }
        }




    }

}
