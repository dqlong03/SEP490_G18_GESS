using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.User;
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
    public class UserRepository : IUserRepository
    {
        private readonly GessDbContext _context;

        private readonly UserManager<User> _userManager;

        public UserRepository(GessDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public Task<User> GetUserByIdAsync(Guid userId)
        {
           return  _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

        }

        public async Task<User> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task UpdateUserAsync(Guid userId, User user)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (existingUser != null)
            {
                existingUser.Fullname = user.Fullname;
                existingUser.UserName = user.UserName;
                existingUser.Email = user.Email;
                existingUser.PhoneNumber = user.PhoneNumber;
                existingUser.DateOfBirth = user.DateOfBirth;
                existingUser.Gender = user.Gender;
                existingUser.IsActive = user.IsActive;
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteUserAsync(Guid userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> IsEmailRegisteredAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);

        }
        public async Task<User?> GetByCodeAndEmailAsync(string code, string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Code == code && u.Email == email);
        }

        public Task<int> CountPageAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize)
        {
            var query = _context.Users.AsQueryable();

            // Filter by active status
            if (active.HasValue)
            {
                query = query.Where(u => u.IsActive == active.Value);
            }
            // Filter by name
            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(u => u.Fullname.ToLower().Contains(name.ToLower()));
            }
            // Filter by date range
            if (fromDate.HasValue)
            {
                query = query.Where(u => u.DateOfBirth >= fromDate.Value);
            }
            if (toDate.HasValue)
            {
                query = query.Where(u => u.DateOfBirth <= toDate.Value);
            }
            // Count the total number of records
            // Ensure that the pageSize is greater than 0
            if (pageSize <= 0)
            {
                throw new ArgumentException("Page size must be greater than zero.", nameof(pageSize));
            }
            // Get the count of records that match the query
            var count = query.Count();
            if (count <= 0)
            {
                throw new InvalidOperationException("Không có dữ liệu để đếm trang.");
            }
            // Calculate total pages
            int totalPages = (int)Math.Ceiling((double)count / pageSize);
            return Task.FromResult(totalPages);
        }

        public async Task<List<UserListDTO>> GetAllUsersAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageNumber, int pageSize)
        {
            var query = _context.Users.AsQueryable();

            // Filter
            if (active.HasValue)
            {
                query = query.Where(u => u.IsActive == active.Value);
            }

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(u => u.Fullname.ToLower().Contains(name.ToLower()));
            }

            if (fromDate.HasValue)
            {
                query = query.Where(u => u.DateOfBirth >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(u => u.DateOfBirth <= toDate.Value);
            }

            // Pagination
            query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);

            var users = await query.ToListAsync();

            var userList = new List<UserListDTO>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);

                userList.Add(new UserListDTO
                {
                    UserId = user.Id,
                    Fullname = user.Fullname,
                    UserName = user.UserName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    DateOfBirth = user.DateOfBirth,
                    Gender = user.Gender,
                    IsActive = user.IsActive,
                    Code = user.Code,
                    Roles = roles.ToList()
                });
            }

            return userList;
        }

        public async Task CreateAsync(User user)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }
    }
}
