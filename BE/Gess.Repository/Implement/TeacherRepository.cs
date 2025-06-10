using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Teacher;
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
    public class TeacherRepository : ITeacherRepository
    {
        private readonly GessDbContext _context;
        private readonly UserManager<User> _userManager;
        public TeacherRepository(GessDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<TeacherResponse> GetTeacherByIdAsync(Guid teacherId)
        {
            var teacher = await _context.Teachers
        .Include(t => t.User)
        .Include(t => t.MajorTeachers)
        .ThenInclude(mt => mt.Major) // Giả sử MajorTeacher có Major
        .FirstOrDefaultAsync(t => t.TeacherId == teacherId);

            if (teacher == null) return null;

            return new TeacherResponse
            {
                TeacherId = teacher.TeacherId,
                UserName = teacher.User.UserName,
                Email = teacher.User.Email,
                PhoneNumber = teacher.User.PhoneNumber,
                DateOfBirth = teacher.User.DateOfBirth,
                LastName = teacher.User.LastName,
                FirstName = teacher.User.FirstName,
                Gender = teacher.User.Gender,
                IsActive = teacher.User.IsActive,
                HireDate = teacher.HireDate,
                MajorTeachers = teacher.MajorTeachers?.Select(mt => new MajorTeacherDto
                {
                    MajorId = mt.MajorId,
                    MajorName = mt.Major?.MajorName 
                }).ToList() ?? new List<MajorTeacherDto>()
            };
        }

        public async Task<List<TeacherResponse>> GetAllTeachersAsync()
        {
            var teachers = await _context.Teachers
         .Include(t => t.User)
         .Include(t => t.MajorTeachers)
         .ThenInclude(mt => mt.Major)
         .ToListAsync();

            return teachers.Select(teacher => new TeacherResponse
            {
                TeacherId = teacher.TeacherId,
                UserName = teacher.User.UserName,
                Email = teacher.User.Email,
                PhoneNumber = teacher.User.PhoneNumber,
                DateOfBirth = teacher.User.DateOfBirth,
                LastName = teacher.User.LastName,
                FirstName = teacher.User.FirstName,
                Gender = teacher.User.Gender,
                IsActive = teacher.User.IsActive,
                HireDate = teacher.HireDate,
                MajorTeachers = teacher.MajorTeachers?.Select(mt => new MajorTeacherDto
                {
                    MajorId = mt.MajorId,
                    MajorName = mt.Major?.MajorName
                }).ToList() ?? new List<MajorTeacherDto>()
            }).ToList();
        }

        public async Task AddTeacherAsync(Guid userId, TeacherCreationRequest request)
        {
            var teacher = new Teacher
            {
                UserId = userId,
                MajorTeachers = request.MajorTeachers,
                HireDate = request.HireDate
            };

            await _context.Teachers.AddAsync(teacher);
            await _context.SaveChangesAsync();
        }

        public async Task<TeacherResponse> UpdateTeacherAsync(Guid teacherId, TeacherUpdateRequest request)
        {
            var existing = await _context.Teachers
                .Include(t => t.User)
                .Include(t => t.MajorTeachers)
                .ThenInclude(mt => mt.Major)
                .FirstOrDefaultAsync(t => t.TeacherId == teacherId);

            if (existing == null)
            {
                throw new Exception("Teacher not found");
            }

            if (existing.User == null)
            {
                throw new Exception("Associated User not found for the Teacher");
            }

            // Cập nhật thông tin User qua UserManager
            existing.User.UserName = request.UserName;
            existing.User.Email = request.Email;
            existing.User.PhoneNumber = request.PhoneNumber;
            existing.User.DateOfBirth = request.DateOfBirth ?? existing.User.DateOfBirth;
            existing.User.LastName = request.LastName;
            existing.User.FirstName = request.FirstName;
            existing.User.Gender = request.Gender;
            existing.User.IsActive = request.IsActive;

            var updateResult = await _userManager.UpdateAsync(existing.User);
            if (!updateResult.Succeeded)
            {
                throw new Exception(string.Join("; ", updateResult.Errors.Select(e => e.Description)));
            }

            // Cập nhật MajorTeachers
            if (request.MajorTeachers != null)
            {
                // Xóa các MajorTeacher hiện có
                _context.MajorTeachers.RemoveRange(existing.MajorTeachers);
                // Thêm các MajorTeacher mới
                existing.MajorTeachers = request.MajorTeachers;
            }

            // Cập nhật HireDate
            existing.HireDate = request.HireDate ?? existing.HireDate;

            await _context.SaveChangesAsync();

            // Trả về DTO
            return new TeacherResponse
            {
                TeacherId = existing.TeacherId,
                UserName = existing.User.UserName,
                Email = existing.User.Email,
                PhoneNumber = existing.User.PhoneNumber,
                DateOfBirth = existing.User.DateOfBirth,
                LastName = existing.User.LastName,
                FirstName = existing.User.FirstName,
                Gender = existing.User.Gender,
                IsActive = existing.User.IsActive,
                HireDate = existing.HireDate,
                MajorTeachers = existing.MajorTeachers?.Select(mt => new MajorTeacherDto
                {
                    MajorId = mt.MajorId,
                    MajorName = mt.Major?.MajorName
                }).ToList() ?? new List<MajorTeacherDto>()
            };
        }

        public async Task DeleteTeacherAsync(Guid teacherId)
        {
            var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.TeacherId == teacherId);
            if (teacher != null)
            {
                _context.Teachers.Remove(teacher);
                await _context.SaveChangesAsync();
            }
        }

    }

}
