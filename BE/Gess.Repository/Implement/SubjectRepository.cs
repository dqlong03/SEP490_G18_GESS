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
    public class SubjectRepository : BaseRepository<Subject>, ISubjectRepository
    {
        private readonly GessDbContext _context;
        public SubjectRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }
    }
    
    
}
