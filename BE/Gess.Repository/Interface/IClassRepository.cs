using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IClassRepository : IBaseRepository<Class>
    {
        Task<IEnumerable<Class>> GetAllClassesAsync();
        Task<Class> GetByIdAsync(int classId);
     
        Task<bool> ClassExistsAsync(string className);
        Task<IEnumerable<Class>> GetAllClassAsync(string? name = null, int pageNumber = 1, int pageSize = 5);
    }
}
