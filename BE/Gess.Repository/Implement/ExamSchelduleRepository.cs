using GESS.Entity.Contexts;
using GESS.Repository.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class ExamSchelduleRepository : IExamSchelduleRepository
    {

        private readonly GessDbContext _context;
        public ExamSchelduleRepository(GessDbContext context)
        {
            _context = context;
        }
    }
}
