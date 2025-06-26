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
    public class ExamScheduleRepository : IExamScheduleRepository
    {

        private readonly GessDbContext _context;
        public ExamScheduleRepository(GessDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ExamSlotRoom>> GetExamScheduleByTeacherIdAsync(Guid teacherId, DateTime fromDate, DateTime toDate)
        {
            var examSchedules = await _context.ExamSlotRooms
                .Where(e => e.SupervisorId == teacherId &&
                    (
                        (e.MultiOrPractice == "Multiple" && e.MultiExam.ExamDate >= fromDate && e.MultiExam.ExamDate <= toDate) ||
                        (e.MultiOrPractice == "Practice" && e.PracticeExam.ExamDate >= fromDate && e.PracticeExam.ExamDate <= toDate)
                    )
                )
                .Include(e => e.Subject)
                .Include(e => e.Room)
                .Include(e => e.MultiExam)
                .Include(e => e.PracticeExam)
                .ToListAsync();
            if (examSchedules == null || !examSchedules.Any())
            {
                return new List<ExamSlotRoom>();
            }
            return examSchedules;

        }
    }
}
