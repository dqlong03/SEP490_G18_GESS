using Gess.Repository.Infrastructures;
using GESS.Common.HandleException;
using GESS.Entity.Entities;
using GESS.Model.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.users
{
    public class UserService : IUserService
    {
        // ThaiNH_Initialize_Begin
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;

        // ThaiNH_Initialize_End
        private readonly IUnitOfWork _unitOfWork;
        public UserService(IUnitOfWork unitOfWork, UserManager<User> userManager, RoleManager<IdentityRole<Guid>> roleManager)
        {
            // ThaiNH_Initialize_Begin
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
            _roleManager = roleManager ?? throw new ArgumentNullException(nameof(roleManager));
        // ThaiNH_Initialize_End
            _unitOfWork = unitOfWork;
        }

   
        
        public async Task<UserListDTO> GetUserByIdAsync(Guid userId)
        {
            var user = await _unitOfWork.UserRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new Exception($"User with ID {userId} not found.");
            }

            return new UserListDTO
            {
                UserId = user.Id,

                // ThaiNH_Modified_UserProfile_Begin

                Fullname = user.Fullname,
                //FirstName = user.FirstName,
                //LastName = user.LastName,

                // ThaiNH_Modified_UserProfile_End

                UserName = user.UserName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                DateOfBirth = user.DateOfBirth,
                Gender = user.Gender,
                IsActive = user.IsActive
            };
        }
        public async Task<List<UserListDTO>> GetAllUsersAsync()
        {
            var users = await _unitOfWork.UserRepository.GetAllUsersAsync();
            return users.Select(user => new UserListDTO
            {
                UserId = user.Id,
                Fullname= user.Fullname,
                UserName = user.UserName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                DateOfBirth = user.DateOfBirth,
            }
            ).ToList();
        }


        // ThaiNH_AddFunction_Begin
        public async Task UpdateUserProfileAsync(Guid userId, UserProfileDTO dto)
        {
            if (userId == Guid.Empty)
            {
                throw new BadRequestException("UserId không hợp lệ.");
            }

            var entity = await _userManager.FindByIdAsync(userId.ToString());
            if (entity == null)
            {
                throw new NotFoundException("Không tìm thấy thông tin người dùng để cập nhật.");
            }

            // Validation: Kiểm tra trùng số điện thoại
            if (!string.IsNullOrEmpty(dto.PhoneNumber))
            {
                var existingUserByPhone = await _userManager.Users
                    .FirstOrDefaultAsync(u => u.PhoneNumber == dto.PhoneNumber && u.Id != userId);
                if (existingUserByPhone != null)
                {
                    throw new ConflictException("Số điện thoại đã được sử dụng.");
                }
            }

            // Kiểm tra email đã tồn tại
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                throw new ConflictException("Email đã được sử dụng.");
            }
            // Validation: Kiểm tra ngày sinh hợp lệ
            var currentDate = DateTime.UtcNow;
            if (dto.DateOfBirth < currentDate)
            {
                throw new Common.HandleException.ValidationException("Ngày sinh không được nhỏ hơn ngày hiện tại.");
            }

            // Cập nhật giá trị
            entity.Fullname = dto.Fullname;
            entity.Email = dto.Email;
            entity.DateOfBirth = dto.DateOfBirth;
            entity.PhoneNumber = dto.PhoneNumber;
            entity.Gender = dto.Gender;
            entity.IsActive = dto.IsActive;

            var result = await _userManager.UpdateAsync(entity);
            if (!result.Succeeded)
            {
                throw new BadRequestException("Lỗi khi cập nhật thông tin người dùng: " + string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }

  

   
        // ThaiNH_AddFunction_End
    }
}
