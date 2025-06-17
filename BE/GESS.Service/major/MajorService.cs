using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Major;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.major
{
    public class MajorService : BaseService<Major>, IMajorService
    {
        private readonly IUnitOfWork _unitOfWork;
        public MajorService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<int> CountPageAsync(int? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize)
        {
            var count = await _unitOfWork.MajorRepository.CountPageAsync(active, name, fromDate,toDate, pageSize);
            if (count <= 0)
            {
                throw new Exception("Không có dữ liệu để đếm trang.");
            }
            return count;
        }

        public async Task<MajorCreateDTO> CreateMajorAsync(MajorCreateDTO majorCreateDto)
        {
            bool majorExists = _unitOfWork.MajorRepository.ExistsAsync(c => c.MajorName == majorCreateDto.MajorName).Result;
            if (majorExists)
            {
                throw new InvalidOperationException("Đã tồn tại ngành có tên này.");
            }
            var major = new Major
            {
                MajorName = majorCreateDto.MajorName,
                StartDate = majorCreateDto.StartDate,
                IsActive = true
            };

            _unitOfWork.MajorRepository.Create(major);
            await _unitOfWork.SaveChangesAsync();

            return majorCreateDto;
        }

        public async Task<MajorUpdateDTO> DeleteMajorById(int majorId)
        {
            var major = await _unitOfWork.MajorRepository.GetByIdAsync(majorId);
            if (major == null)
            {
                throw new InvalidOperationException("Không tìm thấy ngành.");
            }
            major.IsActive = false;
            var majorDTO=new MajorUpdateDTO
            {
                MajorId = major.MajorId,
                MajorName = major.MajorName,
                StartDate = major.StartDate,
                EndDate = major.EndDate,
                IsActive = major.IsActive
            };
            _unitOfWork.MajorRepository.Update(major);
            await _unitOfWork.SaveChangesAsync();

            return majorDTO;
        }

        public async Task<IEnumerable<MajorUpdateDTO>> GetAllAsync()
        {
            var majors = await _unitOfWork.MajorRepository.GetAllAsync();
            return majors.Select(major => new MajorUpdateDTO
            {
                MajorId = major.MajorId,
                MajorName = major.MajorName,
                StartDate = major.StartDate,
                EndDate = major.EndDate,
                IsActive = major.IsActive
            }).ToList();
        }

        public Task<IEnumerable<MajorListDTO>> GetAllMajor()
        {
            var majors = _unitOfWork.MajorRepository.GetAll().Where(m => m.IsActive).ToList();
            return Task.FromResult(majors.Select(major => new MajorListDTO
            {
                MajorId = major.MajorId,
                MajorName = major.MajorName,
               
            }).AsEnumerable());
        }

        public async Task<IEnumerable<MajorUpdateDTO>> GetAllMajorsAsync(int? active, string? name = null, DateTime? fromDate = null, DateTime? toDate = null, int pageNumber = 1, int pageSize = 10)
        {
            var majors = await _unitOfWork.MajorRepository.GetAllMajorsAsync(active, name, fromDate, toDate, pageNumber, pageSize);
            return majors.Select(major => new MajorUpdateDTO
            {
                MajorId = major.MajorId,
                MajorName = major.MajorName,
                StartDate = major.StartDate,
                EndDate = major.EndDate,
                IsActive = major.IsActive
            }).ToList();
        }

        public async Task<MajorDTO> GetMajorById(int majorId)
        {
            var major = await _unitOfWork.MajorRepository.GetMajorByIdAsync(majorId);
            if (major == null)
            {
                throw new InvalidOperationException("Không tìm thấy ngành.");
            }
            return major;
        }

        public async Task<MajorUpdateDTO> UpdateMajorAsync(int id, MajorUpdateDTO majorUpdateDto)
        {
            var major = await _unitOfWork.MajorRepository.GetByIdAsync(id);
            if (major == null)
            {
                throw new InvalidOperationException("Không tìm thấy ngành.");
            }

            major.MajorName = majorUpdateDto.MajorName;
            major.StartDate = majorUpdateDto.StartDate;
            major.EndDate = majorUpdateDto.EndDate;
            major.IsActive = majorUpdateDto.IsActive;

            _unitOfWork.MajorRepository.Update(major);
            await _unitOfWork.SaveChangesAsync();

            return majorUpdateDto;
        }
    }

}
