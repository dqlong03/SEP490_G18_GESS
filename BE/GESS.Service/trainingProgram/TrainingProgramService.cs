using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Major;
using GESS.Model.TrainingProgram;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.trainingProgram
{
    public class TrainingProgramService : BaseService<TrainingProgram>, ITrainingProgramService
    {
        private readonly IUnitOfWork _unitOfWork;
        public TrainingProgramService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public Task<TrainingProgramCreateDTO> CreateTrainingProgramAsync(int majorId, TrainingProgramCreateDTO trainingProgramCreateDTO)
        {
            var checkExistTraningProgram = _unitOfWork.TrainingProgramRepository.TrainingProgramExistsAsync(majorId, trainingProgramCreateDTO.TrainProName);
            if (checkExistTraningProgram.Result)
            {
                throw new ArgumentException("Chương trình đào tạo đã tồn tại.");
            }
            _unitOfWork.TrainingProgramRepository.CreateTrainingProgramAsync(majorId, trainingProgramCreateDTO);
            return Task.FromResult(trainingProgramCreateDTO);
        }

        public Task<bool> DeleteTrainingProgramAsync(int trainingProgramId)
        {
            var trainingProgram = _unitOfWork.TrainingProgramRepository.GetByIdAsync(trainingProgramId);
            if (trainingProgram == null)
            {
                throw new InvalidOperationException("Không tìm thấy chương trình đào tạo.");
            }
            _unitOfWork.TrainingProgramRepository.Delete(trainingProgram.Result);
            return _unitOfWork.SaveChangesAsync().ContinueWith(t => t.Result > 0);
        }

        public async Task<IEnumerable<TrainingProgramDTO>> GetAllTrainingsAsync(int? majorId, string? name = null, DateTime? fromDate = null, DateTime? toDate = null, int pageNumber = 1, int pageSize = 10)
        {
            var traniningPrograms = await _unitOfWork.TrainingProgramRepository.GetAllTrainingsAsync(majorId,name, fromDate, toDate, pageNumber, pageSize);
            return traniningPrograms.Select(major => new TrainingProgramDTO
            {
                TrainingProgramId = major.TrainProId,
                TrainProName = major.TrainProName,
                StartDate = major.StartDate,
                EndDate = major.EndDate,
                NoCredits = major.NoCredits
            }).ToList();
        }

        public Task<TrainingProgramDTO> UpdateTrainingProgramAsync(int trainingProgramId, TrainingProgramDTO trainingProgramUpdateDTO)
        {
            var trainingProgram = _unitOfWork.TrainingProgramRepository.GetByIdAsync(trainingProgramId);
            if (trainingProgram == null)
            {
                throw new InvalidOperationException("Không tìm thấy chương trình đào tạo.");
            }
            var existingProgram = trainingProgram.Result;
            existingProgram.TrainProName = trainingProgramUpdateDTO.TrainProName;
            existingProgram.StartDate = trainingProgramUpdateDTO.StartDate;
            existingProgram.EndDate = trainingProgramUpdateDTO.EndDate;
            existingProgram.NoCredits = trainingProgramUpdateDTO.NoCredits;
            _unitOfWork.TrainingProgramRepository.Update(existingProgram);
            _unitOfWork.SaveChangesAsync();
            return Task.FromResult(new TrainingProgramDTO
            {
                TrainingProgramId = existingProgram.TrainProId,
                TrainProName = existingProgram.TrainProName,
                StartDate = existingProgram.StartDate,
                EndDate = existingProgram.EndDate,
                NoCredits = existingProgram.NoCredits
            });
        }
    }

}
