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
    public class UserRepository : IUserRepository
    {
        private readonly GessDbContext _context;
        public UserRepository(GessDbContext context)
        {
            _context = context;
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public Task<User> GetUserByIdAsync(Guid userId)
        {
           return  _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

        }

        public async Task<bool> IsEmailRegisteredAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }
    }
}
