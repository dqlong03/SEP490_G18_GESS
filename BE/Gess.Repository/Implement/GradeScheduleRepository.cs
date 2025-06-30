using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.ExamSlotRoomDTO;
using GESS.Model.Student;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class GradeScheduleRepository : IGradeScheduleRepository
    {

        private readonly GessDbContext _context;
        public GradeScheduleRepository(GessDbContext context)
        {
            _context = context;
        }

        
    }
}
