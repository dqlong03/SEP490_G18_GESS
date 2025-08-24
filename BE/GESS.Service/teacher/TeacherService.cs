using Gess.Repository.Infrastructures;
using GESS.Common;
using GESS.Entity.Entities;
using GESS.Model.Teacher;
using GESS.Repository.Implement;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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

        public async Task<List<TeacherResponse>> GetAllTeachersAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageNumber, int pageSize)
        {
            return await _unitOfWork.TeacherRepository.GetAllTeachersAsync(active, name, fromDate, toDate, pageNumber, pageSize);
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
        public async Task<int> CountPageAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize)
        {
            var count = await _unitOfWork.TeacherRepository.CountPageAsync(active, name, fromDate, toDate, pageSize);
            if (count <= 0)
            {
                throw new Exception("Không có dữ liệu để đếm trang.");
            }
            return count;
        }

        public async Task<string> RestoreTeacher(Guid teacherId)
        {
            var mss = await _unitOfWork.TeacherRepository.RestoreTeacher(teacherId);
            return mss;

        }

        public async Task<string> AddTeacherListAsync(List<TeacherCreationRequest> list)
        {
            var result = await _unitOfWork.TeacherRepository.AddTeacherListAsync(list);
            return result;
        }
    }

}
