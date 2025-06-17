using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class SemesterRepository : BaseRepository<Semester>, ISemesterRepository
    {
        private readonly GessDbContext _context;
        public SemesterRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Semester>> GetAllAsync(Expression<Func<Semester, bool>> filter)
        {
            return await _context.Semesters.Where(filter).ToListAsync();
        }

    }
}
