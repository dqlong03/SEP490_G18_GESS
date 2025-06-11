using GESS.Entity.Entities;
using Gess.Repository.Infrastructures;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GESS.Model.Teacher;
using Microsoft.AspNetCore.Identity;
using GESS.Common;

namespace GESS.Service.teacher
{
    public class TeacherService : ITeacherService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;


        public TeacherService(IUnitOfWork unitOfWork, UserManager<User> userManager,
            RoleManager<IdentityRole<Guid>> roleManager)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<TeacherResponse> GetTeacherByIdAsync(Guid teacherId)
        {
            var teacher = await _unitOfWork.TeacherRepository.GetTeacherByIdAsync(teacherId);
            if (teacher == null) throw new Exception("Teacher not found");
            return teacher;
        }

        public async Task<List<TeacherResponse>> GetAllTeachersAsync()
        {
            return await _unitOfWork.TeacherRepository.GetAllTeachersAsync();
        }

        public async Task<TeacherResponse> AddTeacherAsync(TeacherCreationRequest request)
        {
            var defaultPassword = "Abc123@";
            // 1. Tạo user
            var user = new User
            {
                UserName = request.UserName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                DateOfBirth = request.DateOfBirth,
                LastName = request.LastName,
                FirstName = request.FirstName,
                Gender = request.Gender,
                IsActive = request.IsActive
            };

            var result = await _userManager.CreateAsync(user, defaultPassword);
            if (!result.Succeeded)
                throw new Exception(string.Join("; ", result.Errors.Select(e => e.Description)));

            // 2. Đảm bảo role "Teacher" tồn tại
            if (!await _roleManager.RoleExistsAsync(PredefinedRole.TEACHER_ROLE))
            {
                await _roleManager.CreateAsync(new IdentityRole<Guid>(PredefinedRole.TEACHER_ROLE));
            }

            // 3. Gán role cho user
            await _userManager.AddToRoleAsync(user, PredefinedRole.TEACHER_ROLE);

            // 4. Tạo Teacher
            await _unitOfWork.TeacherRepository.AddTeacherAsync(user.Id, request);

            // 5. Lấy lại teacher vừa tạo
            var teachers = await _unitOfWork.TeacherRepository.GetAllTeachersAsync();
            var teacher = teachers.LastOrDefault(t => t.UserName == request.UserName && t.Email == request.Email);
            return teacher;
        }

        public async Task<TeacherResponse> UpdateTeacherAsync(Guid teacherId, TeacherUpdateRequest request)
        {
            await _unitOfWork.TeacherRepository.UpdateTeacherAsync(teacherId, request);
            await _unitOfWork.SaveChangesAsync();
            var teacher = await _unitOfWork.TeacherRepository.GetTeacherByIdAsync(teacherId);
            if (teacher == null) throw new Exception("Teacher not found");
            return teacher;
        }

        public async Task DeleteTeacherAsync(Guid teacherId)
        {
            await _unitOfWork.TeacherRepository.DeleteTeacherAsync(teacherId);
            await _unitOfWork.SaveChangesAsync();
        }

        public Task SendResetPasswordEmailAsync(Guid userId, string resetPasswordUrlBase)
        {
            throw new NotImplementedException();
        }

        public async Task<List<TeacherResponse>> SearchTeachersAsync(string keyword)
        {
            return await _unitOfWork.TeacherRepository.SearchTeachersAsync(keyword);
        }
    }

}
