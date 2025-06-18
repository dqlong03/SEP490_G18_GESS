using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


using GESS.Model.User;

namespace GESS.Repository.Interface
{
    public interface IUserRepository 
    {
        public Task<User> GetUserByIdAsync(Guid userId);
        //public Task<List<User>> GetAllUsersAsync();
        public Task UpdateUserAsync(Guid userId, User user);
        Task DeleteUserAsync(Guid userId);
        Task<bool> IsEmailRegisteredAsync(string email);
        Task<User?> GetByCodeAndEmailAsync(string code, string email);

        Task<int> CountPageAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize);
        Task<List<UserListDTO>> GetAllUsersAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageNumber, int pageSize);
        public Task CreateAsync(User user);
        public Task<User> GetByEmailAsync(string email);
    }
}
