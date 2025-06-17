using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface ISemesterRepository : IBaseRepository<Semester>
    {
        Task<IEnumerable<Semester>> GetAllAsync(Expression<Func<Semester, bool>> filter);

    }
}
