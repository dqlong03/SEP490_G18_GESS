using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.users
{
    public class UserService : IUserService
    {

        private readonly IUnitOfWork _unitOfWork;
        public UserService(IUnitOfWork unitOfWork)
        {
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
                FirstName = user.FirstName,
                LastName = user.LastName,
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
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserName = user.UserName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                DateOfBirth = user.DateOfBirth,
            }
            ).ToList();
        }

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

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.UserName = request.UserName;
            user.Email = request.Email;
            user.PhoneNumber = request.PhoneNumber;
            user.DateOfBirth = request.DateOfBirth;
            user.Gender = request.Gender;
            user.IsActive = request.IsActive;

            await _unitOfWork.UserRepository.UpdateUserAsync(userId, user);
            await _unitOfWork.SaveChangesAsync();

            return new UserListDTO
            {
                UserId = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserName = user.UserName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                DateOfBirth = user.DateOfBirth,
                Gender = user.Gender,
                IsActive = user.IsActive
            };
        }


        public async Task<bool> IsEmailRegisteredAsync(string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return false;
            }

            return await _unitOfWork.UserRepository.IsEmailRegisteredAsync(email);

        }
    }
}
