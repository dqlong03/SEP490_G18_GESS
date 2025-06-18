using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.MultiExamHistories;
using GESS.Model.MultipleExam;
using GESS.Model.TrainingProgram;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class PracticeExamRepository : BaseRepository<PracticeExam>, IPracticeExamRepository
    {
        private readonly GessDbContext _context;
        public PracticeExamRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }

    }
    
    
}
