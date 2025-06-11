using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.TrainingProgram;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class TrainingProgramRepository : BaseRepository<TrainingProgram>, ITrainingProgramRepository
    {
        private readonly GessDbContext _context;
        public TrainingProgramRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<int> CountPageAsync(int majorId, string? name, DateTime? fromDate, DateTime? toDate, int pageSize)
        {
            var query = _context.TrainingPrograms.AsQueryable();
            query = query.Where(tp => tp.MajorId == majorId);
            // Filter by name if provided
            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(tp => tp.TrainProName.ToLower().Contains(name.ToLower()));
            }
            // Filter by date range if provided
            if (fromDate.HasValue)
            {
                query = query.Where(tp => tp.StartDate >= fromDate.Value);
            }
            if (toDate.HasValue)
            {
                query = query.Where(tp => tp.EndDate <= toDate.Value);
            }
            // Count the total number of training programs
            var totalCount = await query.CountAsync();
            if (totalCount <= 0)
            {
                throw new InvalidOperationException("Không có dữ liệu để đếm trang.");
            }
            return totalCount;

        }

        public Task<TrainingProgram> CreateTrainingProgramAsync(int majorId, TrainingProgramCreateDTO trainingProgramDto)
        {
            var trainingProgram = new TrainingProgram
            {
                TrainProName = trainingProgramDto.TrainProName,
                StartDate = trainingProgramDto.StartDate,
                MajorId = majorId,
                NoCredits = trainingProgramDto.NoCredits
            };
            _context.TrainingPrograms.Add(trainingProgram);
            _context.SaveChanges();
            return Task.FromResult(trainingProgram);
        }

        public async Task<IEnumerable<TrainingProgram>> GetAllTrainingsAsync(int? majorId, string? name = null, DateTime? fromDate = null, DateTime? toDate = null, int pageNumber = 1, int pageSize = 10)
        {
            IQueryable<TrainingProgram> query = _context.TrainingPrograms.Where(m => m.MajorId==majorId);

            // Filter by name if provided
            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(m => m.TrainProName.ToLower().Contains(name.ToLower()));
            }

            // Filter by date range if provided
            if (fromDate.HasValue)
            {
                query = query.Where(m => m.StartDate >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(m => m.EndDate <= toDate.Value);
            }

            // Apply pagination
            query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);

            return await query.ToListAsync();
        }

        public Task<bool> TrainingProgramExistsAsync(int majorId, string trainingProgramName)
        {
            var major = _context.Majors
            .Include(m => m.TrainingPrograms)
            .FirstOrDefault(m => m.MajorId == majorId);
            if (major == null)
            {
                throw new ArgumentException("Không tìm thấy ngành.");
            }
            var exists = _context.TrainingPrograms
                .Any(tp => tp.MajorId == majorId && tp.TrainProName.ToLower() == trainingProgramName.ToLower());
            return Task.FromResult(exists);
        }
    }
    
    
}
