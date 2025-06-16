using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class StudentRepository : BaseRepository<Student>, IStudentRepository
    {
        private readonly GessDbContext _context;
        private readonly UserManager<User> _userManager;
        public StudentRepository(GessDbContext context, UserManager<User> userManager)
    : base(context)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task AddStudent(Guid id, Student student)
        {
            var newStudent = new Student
            {
                StudentId = id,
                UserId = student.UserId,
                CohortId = student.CohortId,
                EnrollDate = student.EnrollDate
            };
          
            await _context.Students.AddAsync(newStudent);
            await _context.SaveChangesAsync();
        }

        public Task<Student> GetStudentbyUserId(Guid userId)
        {
            var student = _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
                {
                throw new InvalidOperationException($"Student with UserId {userId} not found.");
            }
            return student;
        }
    }
}
