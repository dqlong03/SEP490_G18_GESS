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
        public async Task<IEnumerable<Chapter>> GetAllChapterAsync(string? name = null, int pageNumber = 1, int pageSize = 10)
        {
            IQueryable<Chapter> query = _context.Chapters.Include(s => s.Subject);
            if (!string.IsNullOrWhiteSpace(name))
            {
                var loweredName = name.ToLower();
                query = query.Where(m =>
                    m.ChapterName.ToLower().Contains(loweredName) ||
                    m.Description.ToLower().Contains(loweredName));
            }
            query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);

            return await query.ToListAsync();

        }

        public async Task<IEnumerable<Chapter>> GetAllChaptersAsync()
        {
            var chapter = _context.Chapters.Include(c => c.Subject) 
                .ToListAsync(); 
            return await chapter; 
        }
        public async Task<Chapter> GetByIdAsync(int chapterId)
        {
            var chapter = await _context.Chapters.Include(c => c.Subject)
                .FirstOrDefaultAsync(c => c.ChapterId == chapterId);
            return chapter;
        }

        public async Task<IEnumerable<Chapter>> GetBySubjectIdAsync(int subjectId, string? name = null, int pageNumber = 1, int pageSize = 10)
        {
            IQueryable<Chapter> query = _context.Chapters
                .Include(s => s.Subject)
                .Where(c => c.SubjectId == subjectId); 

            if (!string.IsNullOrWhiteSpace(name))
            {
                var loweredName = name.ToLower();
                query = query.Where(m =>
                    m.ChapterName.ToLower().Contains(loweredName) ||
                    m.Description.ToLower().Contains(loweredName));
            }

            query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<Chapter>> GetChaptersBySubjectId(int subjectId)
        {
            var chapters = await _context.Chapters
                .Where(c => c.SubjectId == subjectId)
                .ToListAsync();
            return chapters;
        }
    }


}
