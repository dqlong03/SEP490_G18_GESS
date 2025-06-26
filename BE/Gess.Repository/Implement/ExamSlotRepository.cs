using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class ExamSlotRepository : IExamSlotRepository
    {
        private readonly GessDbContext _context;
        public ExamSlotRepository(GessDbContext context)
        {
            _context = context;
        }
    }
    
}