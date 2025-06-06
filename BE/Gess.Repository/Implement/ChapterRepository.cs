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
    public class ChapterRepository : BaseRepository<Chapter>, IChapterRepository
    {
        private readonly GessDbContext _context;
        public ChapterRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Chapter>> GetAllChaptersAsync()
        {
            var chapter = _context.Chapters.Include(c => c.Subject) 
                .ToListAsync(); 
            return await chapter; 
        }
    }
    
    
}
