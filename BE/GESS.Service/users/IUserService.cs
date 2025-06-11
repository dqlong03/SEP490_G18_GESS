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
        Task<List<UserListDTO>> GetAllUsersAsync();

        // ThaiNH_Add_Begin
        Task UpdateUserProfileAsync(Guid userId, UserProfileDTO dto);
        // ThaiNH_Add_End
        Task<UserListDTO> UpdateUserAsync(Guid userId, UserUpdateRequest request);
        Task DeleteUserAsync(Guid userId);
        Task<bool> IsEmailRegisteredAsync(string email);
    }
}
