using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface ITrainingProgramRepository : IBaseRepository<TrainingProgram>
    {
        // Add training program to major
        public Task<TrainingProgram> CreateTrainingProgramAsync(int majorId, TrainingProgramCreateDTO trainingProgramDto);
        Task<IEnumerable<TrainingProgram>> GetAllTrainingsAsync(int? majorId, string? name = null, DateTime? fromDate = null, DateTime? toDate = null, int pageNumber = 1, int pageSize = 10);
        //Check if training program exists
        public Task<bool> TrainingProgramExistsAsync(int majorId, string trainingProgramName);
    }
}
