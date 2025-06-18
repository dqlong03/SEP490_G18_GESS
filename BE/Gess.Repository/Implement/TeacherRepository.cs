using Gess.Repository.Infrastructures;
using GESS.Common;
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
    public class TeacherRepository : BaseRepository<Teacher>, ITeacherRepository
    {
        private readonly GessDbContext _context;
        private readonly UserManager<User> _userManager;
        public TeacherRepository(GessDbContext context, UserManager<User> userManager) : base(context)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<TeacherResponse> GetTeacherByIdAsync(Guid teacherId)
        {
            var teacher = await _context.Teachers
                .Include(t => t.User)
                .Include(m => m.Major)
                .FirstOrDefaultAsync(t => t.TeacherId == teacherId);

            if (teacher == null) return null;

            return new TeacherResponse
            {
                TeacherId = teacher.TeacherId,
                UserName = teacher.User.UserName,
                Email = teacher.User.Email,
                PhoneNumber = teacher.User.PhoneNumber,
                DateOfBirth = teacher.User.DateOfBirth,
                Code = teacher.User.Code,
                Gender = teacher.User.Gender,
                IsActive = teacher.User.IsActive,
                HireDate = teacher.HireDate,
                MajorName = teacher.Major.MajorName,
            };
        }

        public async Task<List<TeacherResponse>> GetAllTeachersAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageNumber, int pageSize)
        {
            var query = _context.Teachers
                .Include(t => t.User)
                .Include(m => m.Major)
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
                Code = teacher.User.Code,
                MajorName = teacher.Major.MajorName
            }).ToList();
        }

        public async Task<TeacherResponse> AddTeacherAsync(TeacherCreationRequest request)
        {
            // Kiểm tra và tạo/cập nhật User
            var user = await _userManager.FindByNameAsync(request.UserName);
            if (user == null)
            {
                // Tạo mới User nếu chưa tồn tại
                user = new User
                {
                    UserName = request.UserName,
                    Email = request.Email,
                    PhoneNumber = request.PhoneNumber,
                    Fullname = request.Fullname,
                    Code = request.Code,
                    DateOfBirth = request.DateOfBirth,
                    Gender = request.Gender,
                    IsActive = request.IsActive,
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var result = await _userManager.CreateAsync(user, "Abc123@"); 
                if (!result.Succeeded)
                {
                    throw new Exception($"Không thể tạo người dùng: {string.Join("; ", result.Errors.Select(e => e.Description))}");
                }

                // Gán role "Teacher" cho user mới
                var roleResult = await _userManager.AddToRoleAsync(user, PredefinedRole.TEACHER_ROLE);
                if (!roleResult.Succeeded)
                {
                    // Nếu gán role thất bại, có thể xóa user vừa tạo (tùy chọn)
                    await _userManager.DeleteAsync(user);
                    throw new Exception($"Không thể gán role 'Giáo viên' cho người dùng: {string.Join("; ", roleResult.Errors.Select(e => e.Description))}");
                }
            }
            else
            {
                // Cập nhật thông tin User nếu đã tồn tại
                user.Email = request.Email;
                user.PhoneNumber = request.PhoneNumber;
                user.Fullname = request.Fullname;
                user.Code = request.Code;
                user.DateOfBirth = request.DateOfBirth ;
                user.Gender = request.Gender;
                user.IsActive = request.IsActive;
                user.UpdatedAt = DateTime.UtcNow;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    throw new Exception($"Không thể cập nhật người dùng: {string.Join("; ", result.Errors.Select(e => e.Description))}");
                }

                // Đảm bảo role "Teacher" được gán (nếu chưa có)
                if (!await _userManager.IsInRoleAsync(user, PredefinedRole.TEACHER_ROLE))
                {
                    var roleResult = await _userManager.AddToRoleAsync(user, PredefinedRole.TEACHER_ROLE);
                    if (!roleResult.Succeeded)
                    {
                        throw new Exception($"Không thể gán role 'Giáo viên' cho người dùng: {string.Join("; ", roleResult.Errors.Select(e => e.Description))}");
                    }
                }
            }

            // Tìm MajorId dựa trên MajorName
            var major = await _context.Majors
                .FirstOrDefaultAsync(m => m.MajorName.Trim().ToLower() == request.MajorName.Trim().ToLower() && m.IsActive);
            if (major == null)
            {
                throw new Exception($"Chuyên ngành với tên '{request.MajorName}' không tồn tại hoặc không hoạt động.");
            }

            // Tạo teacher với MajorId hợp lệ
            var teacher = new Teacher
            {
                UserId = user.Id,
                MajorId = major.MajorId,
                HireDate = request.HireDate 
            };

            await _context.Teachers.AddAsync(teacher);
            await _context.SaveChangesAsync();

            // Lấy lại teacher vừa thêm để trả về response
            var entity = await _context.Teachers
                .Include(t => t.User)
                .Include(m => m.Major)
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
                Code = entity.User.Code,
                HireDate = entity.HireDate,
                MajorId = entity.MajorId,
                MajorName = entity.Major.MajorName
            };
        }


        public async Task<TeacherResponse> UpdateTeacherAsync(Guid teacherId, TeacherUpdateRequest request)
        {
            var existing = await _context.Teachers
                .Include(t => t.User)
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
            existing.User.Code = request.Code ?? existing.User.Code;
            existing.User.Gender = request.Gender;
            existing.User.IsActive = request.IsActive;

            var updateResult = await _userManager.UpdateAsync(existing.User);
            if (!updateResult.Succeeded)
            {
                throw new Exception(string.Join("; ", updateResult.Errors.Select(e => e.Description)));
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
                Code = existing.User.Code,
                HireDate = existing.HireDate,
                MajorName = existing.Major.MajorName
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
                .Where(t =>
                    t.User.UserName.ToLower().Contains(keyword) ||
                    t.User.Email.ToLower().Contains(keyword) ||
                    t.User.Fullname.ToLower().Contains(keyword) ||
                    t.User.PhoneNumber.ToLower().Contains(keyword) ||
                    t.User.Code.ToLower().Contains(keyword) 
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
                Code = teacher.User.Code,
                HireDate = teacher.HireDate,
                MajorName = teacher.Major.MajorName
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
