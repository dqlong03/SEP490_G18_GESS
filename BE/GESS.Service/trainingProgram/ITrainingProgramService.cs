using GESS.Entity.Entities;
using GESS.Model.Major;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.trainingProgram
{
    public interface ITrainingProgramService : IBaseService<TrainingProgram>
    {
        Task<IEnumerable<TrainingProgramDTO>> GetAllTrainingsAsync(int? majorId,string? name = null, DateTime? fromDate = null, DateTime? toDate = null, int pageNumber = 1, int pageSize = 10);
        Task<TrainingProgramCreateDTO> CreateTrainingProgramAsync(int majorId, TrainingProgramCreateDTO trainingProgramCreateDTO);
        // Delete training program
        Task<bool> DeleteTrainingProgramAsync(int trainingProgramId);
        // Update training program
        Task<TrainingProgramDTO> UpdateTrainingProgramAsync(int trainingProgramId, TrainingProgramDTO trainingProgramUpdateDTO);
        Task<int> CountPageAsync(int majorId, string? name, DateTime? fromDate, DateTime? toDate, int pageSize);
    }
}
