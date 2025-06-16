using GESS.Entity.Entities;
using GESS.Model.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.users
{
    public interface IUserService
    {
        Task<UserListDTO> GetUserByIdAsync(Guid userId);

        // ThaiNH_Add_Begin
        Task UpdateUserProfileAsync(Guid userId, UserProfileDTO dto);
        // ThaiNH_Add_End
        Task<UserListDTO> UpdateUserAsync(Guid userId, UserUpdateRequest request);
        Task DeleteUserAsync(Guid userId);
        Task<bool> IsEmailRegisteredAsync(string email);
        Task<List<UserListDTO>> GetAllUserAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageNumber, int pageSize);
        Task<int> CountPageAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize);
    }
}
