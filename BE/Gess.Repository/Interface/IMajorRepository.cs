using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Major;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IMajorRepository : IBaseRepository<Major>
    {
        Task<int> CountPageAsync(int? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize);
        public Task<IEnumerable<Major>> GetAllMajorsAsync(int? active, string? name = null, DateTime? fromDate = null, DateTime? toDate = null, int pageNumber = 1, int pageSize = 10);

        // View major detail include training programs
        public Task<MajorDTO> GetMajorByIdAsync(int majorId);

    }
}
