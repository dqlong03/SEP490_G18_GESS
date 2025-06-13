using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Examination;
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
        .ThenInclude(mt => mt.Major) 
        .FirstOrDefaultAsync(t => t.TeacherId == teacherId);

            if (teacher == null) return null;

            return new TeacherResponse
            {
                TeacherId = teacher.TeacherId,
                UserName = teacher.User.UserName,
                Email = teacher.User.Email,
                PhoneNumber = teacher.User.PhoneNumber,
                DateOfBirth = teacher.User.DateOfBirth,
                
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

        public async Task<List<TeacherResponse>> GetAllTeachersAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageNumber, int pageSize)
        {
            var query = _context.Teachers
                .Include(t => t.User)
                .Include(t => t.MajorTeachers)
                .ThenInclude(mt => mt.Major)
                .AsQueryable();

            if (active.HasValue)
            {
                query = query.Where(t => t.User.IsActive == active.Value);
            }
            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(t => t.User.Fullname.ToLower().Contains(name.ToLower()));
            }
            if (fromDate.HasValue)
            {
                query = query.Where(t => t.HireDate >= fromDate.Value);
            }
            if (toDate.HasValue)
            {
                query = query.Where(t => t.HireDate <= toDate.Value);
            }

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            var teachers = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return teachers.Select(teacher => new TeacherResponse
            {
                TeacherId = teacher.TeacherId,
                UserName = teacher.User.UserName,
                Email = teacher.User.Email,
                PhoneNumber = teacher.User.PhoneNumber,
                DateOfBirth = teacher.User.DateOfBirth,
                Fullname = teacher.User.Fullname,
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

        public async Task<TeacherResponse> AddTeacherAsync(Guid userId, TeacherCreationRequest request)
        {
            var teacher = new Teacher
            {
                UserId = userId,
                MajorTeachers = request.MajorTeachers,
                HireDate = request.HireDate
            };
            await _context.Teachers.AddAsync(teacher);
            await _context.SaveChangesAsync();

            // Lấy lại teacher vừa thêm
            var entity = await _context.Teachers
                .Include(t => t.User)
                .Include(t => t.MajorTeachers).ThenInclude(mt => mt.Major)
                .FirstOrDefaultAsync(t => t.TeacherId == teacher.TeacherId);

            return new TeacherResponse
            {
                TeacherId = entity.TeacherId,
                UserName = entity.User.UserName,
                Email = entity.User.Email,
                PhoneNumber = entity.User.PhoneNumber,
                DateOfBirth = entity.User.DateOfBirth,
                Fullname = entity.User.Fullname,
                Gender = entity.User.Gender,
                IsActive = entity.User.IsActive,
                HireDate = entity.HireDate,
                MajorTeachers = entity.MajorTeachers?.Select(mt => new MajorTeacherDto
                {
                    MajorId = mt.MajorId,
                    MajorName = mt.Major?.MajorName
                }).ToList() ?? new List<MajorTeacherDto>()
            };
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
            existing.User.Fullname = request.Fullname;
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
                Fullname = existing.User.Fullname,
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

        
        public async Task<List<TeacherResponse>> SearchTeachersAsync(string keyword)
        {
            keyword = keyword?.ToLower() ?? "";
            var teachers = await _context.Teachers
                .Include(t => t.User)
                .Include(t => t.MajorTeachers)
                .ThenInclude(mt => mt.Major)
                .Where(t =>
                    t.User.UserName.ToLower().Contains(keyword) ||
                    t.User.Email.ToLower().Contains(keyword) ||
                    t.User.Fullname.ToLower().Contains(keyword) ||
                    t.User.PhoneNumber.ToLower().Contains(keyword)
                )
                .ToListAsync();

            return teachers.Select(teacher => new TeacherResponse
            {
                TeacherId = teacher.TeacherId,
                UserName = teacher.User.UserName,
                Email = teacher.User.Email,
                PhoneNumber = teacher.User.PhoneNumber,
                DateOfBirth = teacher.User.DateOfBirth,
                Fullname = teacher.User.Fullname,
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

        public Task<int> CountPageAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize)
        {
            var query = _context.Teachers.AsQueryable();
            if (active.HasValue)
            {
                query = query.Where(e => e.User.IsActive == active.Value);
            }
            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(e => e.User.Fullname.ToLower().Contains(name.ToLower()));
            }
            if (fromDate.HasValue)
            {
                query = query.Where(e => e.HireDate >= fromDate.Value);
            }
            if (toDate.HasValue)
            {
                query = query.Where(e => e.HireDate <= toDate.Value);
            }
            var count = query.Count();
            if (count <= 0)
            {
                throw new InvalidOperationException("Không có dữ liệu để đếm trang.");
            }
            // Calculate total pages
            int totalPages = (int)Math.Ceiling((double)count / pageSize);
            return Task.FromResult(totalPages);
        }
    }

}
