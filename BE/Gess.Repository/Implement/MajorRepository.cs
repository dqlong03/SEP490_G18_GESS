using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using GESS.Model.Major;
using GESS.Model.TrainingProgram;

namespace GESS.Repository.Implement
{
    public class MajorRepository : BaseRepository<Major>, IMajorRepository
    {
        private readonly GessDbContext _context;
        public MajorRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Major>> GetAllMajorsAsync(string? name = null, DateTime? fromDate = null, DateTime? toDate = null, int pageNumber = 1, int pageSize = 10)
        {
            IQueryable<Major> query = _context.Majors.Where(m=>m.IsActive==true);

            // Filter by name if provided
            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(m => m.MajorName.ToLower().Contains(name.ToLower()));
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

        public async Task<MajorDTO> GetMajorByIdAsync(int majorId)
        {
            var major = await _context.Majors
                .Include(m => m.TrainingPrograms)
                .FirstOrDefaultAsync(m => m.MajorId == majorId);

            if (major == null)
            {
                throw new InvalidOperationException("Không tìm thấy ngành.");
            }

            return new MajorDTO
            {
                MajorId = major.MajorId,
                MajorName = major.MajorName,
                TrainingPrograms = major.TrainingPrograms.Select(tp => new TrainingProgramDTO
                {
                    TrainingProgramId = tp.TrainProId,
                    TrainProName = tp.TrainProName,
                    StartDate = tp.StartDate,
                    EndDate = tp.EndDate,
                    NoCredits = tp.NoCredits
                }).ToList()
            };
        }
    }


}
