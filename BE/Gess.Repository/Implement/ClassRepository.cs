using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class ClassRepository : BaseRepository<Class>, IClassRepository
    {
        private readonly GessDbContext _context;
        public ClassRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }

        public Task<bool> ClassExistsAsync(string className)
        {
            var exists = _context.Classes.AnyAsync(c => c.ClassName == className);
            return exists;
        }

       
        public async Task<IEnumerable<Class>> GetAllClassAsync(string? name = null, int pageNumber = 1, int pageSize = 5)
        {
            IQueryable<Class> query = _context.Classes.Include(s => s.Subject).Include(se => se.Semester);
            if (!string.IsNullOrWhiteSpace(name))
            {
                var loweredName = name.ToLower();
                query = query.Where(m =>
                    m.ClassName.ToLower().Contains(loweredName));
            }
            query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);

            return await query.ToListAsync();

        }

        public async Task<IEnumerable<Class>> GetAllClassesAsync()
        {
            var classes = _context.Classes.Include(c => c.Subject).Include(c => c.Teacher).Include(c => c.Semester)
                 .ToListAsync();
            return await classes;
        }

        
    }
}
