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

        public async Task<int> CountPageAsync(int? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize)
        {
            var query = _context.Majors.AsQueryable();
            // Filter by active status if provided
            if (active.HasValue)
            {
                query = query.Where(m => m.IsActive == (active.Value == 1));
            }
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
            // Count total records
            var count = await query.CountAsync();
            if (count <= 0)
            {
                throw new InvalidOperationException("Không có dữ liệu để đếm trang.");
            }
            // Calculate total pages
            int totalPages = (int)Math.Ceiling((double)count / pageSize);
            return totalPages;

        }

        public async Task<IEnumerable<Major>> GetAllMajorsAsync(int? active, string? name = null, DateTime? fromDate = null, DateTime? toDate = null, int pageNumber = 1, int pageSize = 10)
        {
            IQueryable<Major> query = _context.Majors;
            // Filter by active status if provided
            if (active.HasValue)
            {
                query = query.Where(m => m.IsActive == (active.Value == 1));
            }

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
