using Gess.Repository.Infrastructures;
using GESS.Common;
using GESS.Common.HandleException;
using GESS.Entity.Entities;
using GESS.Model.Student;
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


        // ThaiNH_modified_UpdateMark&UserProfile_Begin

        public async Task<UserListDTO> GetUserByIdAsync(Guid userId)
        {
            var user = await _unitOfWork.UserRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new Exception($"User with ID {userId} not found.");
            }
            var roles = await _userManager.GetRolesAsync(user);


            // Tìm vai trò chính (chỉ lấy 1 role chính nếu bạn giới hạn vậy)
            var mainRole = roles.FirstOrDefault(r =>
                r == PredefinedRole.ADMIN_ROLE || r == PredefinedRole.EXAMINATION_ROLE || r == PredefinedRole.TEACHER_ROLE || r == PredefinedRole.STUDENT_ROLE || r == PredefinedRole.HEADOFDEPARTMENT_ROLE
            );
            return new UserListDTO
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
                MainRole = mainRole
            };
        }
        // ThaiNH_modified_UpdateMark&UserProfile_End



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

        public async Task DeleteUserAsync(Guid userId)
        {
            var user = await _unitOfWork.UserRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new Exception($"User with ID {userId} not found.");
            }
            await _unitOfWork.UserRepository.DeleteUserAsync(userId);
            await _unitOfWork.SaveChangesAsync();
        }


        public async Task<UserListDTO> UpdateUserAsync(Guid userId, UserUpdateRequest request)
        {
            var user = await _unitOfWork.UserRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new Exception($"User with ID {userId} not found.");
            }

            user.Fullname = request.Fullname;
            user.UserName = request.UserName;
            user.Email = request.Email;
            user.PhoneNumber = request.PhoneNumber;
            user.DateOfBirth = request.DateOfBirth;
            user.Gender = request.Gender;
            user.Code = request.Code;

            user.IsActive = request.IsActive;

            await _unitOfWork.UserRepository.UpdateUserAsync(userId, user);
            await _unitOfWork.SaveChangesAsync();

            var roles = await _userManager.GetRolesAsync(user);

            return new UserListDTO
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
            };
        }

        public async Task<int> CountPageAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize)
        {
            var count = await _unitOfWork.UserRepository.CountPageAsync(active, name, fromDate, toDate, pageSize);
            if (count <= 0)
            {
                throw new Exception("Không có dữ liệu để đếm trang.");
            }
            return count;
        }

        public async Task<bool> IsEmailRegisteredAsync(string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return false;
            }

            return await _unitOfWork.UserRepository.IsEmailRegisteredAsync(email);

        }

        public async Task<List<UserListDTO>> GetAllUserAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageNumber, int pageSize)
        {
            return await _unitOfWork.UserRepository.GetAllUsersAsync(active, name, fromDate, toDate, pageNumber, pageSize);
        }
    }
}
