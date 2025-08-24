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
                Fullname = teacher.User.Fullname,
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
                MajorName = teacher.Major.MajorName,
                totalPage = totalPages
            }).ToList();
        }

        public async Task<TeacherResponse> AddTeacherAsync(TeacherCreationRequest request, bool saveChanges = true)
        {
            var user = new User
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
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                NormalizedEmail = request.Email.ToUpper(),
                NormalizedUserName = request.UserName.ToUpper(),
                EmailConfirmed = true,
                PasswordHash = _userManager.PasswordHasher.HashPassword(null, request.Password ?? "Password123!")    
            };

            await _context.Users.AddAsync(user);

            var teacherRole = await _context.Roles
                .FirstOrDefaultAsync(r => r.Name == PredefinedRole.TEACHER_ROLE);

            if (teacherRole == null)
            {
                teacherRole = new IdentityRole<Guid>
                {
                    Name = "Giáo viên",
                    NormalizedName = PredefinedRole.TEACHER_ROLE.ToUpper(),
                    Id = Guid.NewGuid()
                };
                await _context.Roles.AddAsync(teacherRole);
            }

            var userRole = new IdentityUserRole<Guid>
            {
                UserId = user.Id,
                RoleId = teacherRole.Id
            };
            _context.UserRoles.Add(userRole);

            var major = await _context.Majors
                .FirstOrDefaultAsync(m => m.MajorId == request.MajorId && m.IsActive);
            if (major == null)
            {
                throw new Exception($"Chuyên ngành với tên '{request.MajorName}' không tồn tại hoặc không hoạt động.");
            }

            var teacher = new Teacher
            {
                UserId = user.Id,
                MajorId = major.MajorId,
                HireDate = request.HireDate
            };
            await _context.Teachers.AddAsync(teacher);

            if (saveChanges)
            {
                await _context.SaveChangesAsync();
            }

            return new TeacherResponse
            {
                TeacherId = teacher.TeacherId,
                UserName = user.UserName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                DateOfBirth = user.DateOfBirth,
                Fullname = user.Fullname,
                Gender = user.Gender,
                IsActive = user.IsActive,
                Code = user.Code,
                HireDate = teacher.HireDate,
                MajorId = teacher.MajorId,
                MajorName = major.MajorName
            };
        }


        public async Task<TeacherResponse> UpdateTeacherAsync(Guid teacherId, TeacherUpdateRequest request)
        {
            var existing = await _context.Teachers
                .Include(t => t.User)
                .Include(t => t.Major)
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
            existing.User.PhoneNumber = request.PhoneNumber;
            existing.User.DateOfBirth = request.DateOfBirth ?? existing.User.DateOfBirth;
            existing.User.Fullname = request.Fullname;
            existing.User.Gender = request.Gender;
            existing.User.IsActive = request.IsActive;

            _context.Update(existing.User);
           

            // Cập nhật HireDate
            existing.HireDate = request.HireDate ?? existing.HireDate;
            _context.Update(existing);
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
                //Tim kiếm User liên kết với Teacher
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == teacher.UserId);
                //Chuyen trang thai IsActive của User
                if (user != null)
                {
                    user.IsActive = false;
                    user.UpdatedAt = DateTime.Now;
                    _context.Update(user);
                }
                _context.SaveChanges();
            }
        }


        public async Task<List<TeacherResponse>> SearchTeachersAsync(string keyword)
        {
            keyword = keyword?.ToLower() ?? "";

            var teachers = await _context.Teachers
                .Include(t => t.User)
                .Include(t => t.Major)
                .Where(t =>
                    (t.User.UserName ?? "").ToLower().Contains(keyword) ||
                    (t.User.Email ?? "").ToLower().Contains(keyword) ||
                    (t.User.Fullname ?? "").ToLower().Contains(keyword) ||
                    (t.User.PhoneNumber ?? "").ToLower().Contains(keyword) ||
                    (t.User.Code ?? "").ToLower().Contains(keyword)
                )
                .Select(teacher => new TeacherResponse
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
                })
                .ToListAsync();

            return teachers;
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

        public async Task<string> RestoreTeacher(Guid teacherId)
        {
            var teacher = await _context.Teachers
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.TeacherId == teacherId);
            if (teacher == null)
            {
                return "Teacher not found"; 
            }
            if (teacher.User.IsActive)
            {
                return "Teacher is already active.";
            }
            // Restore User
            teacher.User.IsActive = true;
            teacher.User.UpdatedAt = DateTime.Now;
            _context.Update(teacher.User);
            await _context.SaveChangesAsync();
            return "Teacher restored successfully.";
        }

        public async Task<string> AddTeacherListAsync(List<TeacherCreationRequest> list)
        {
            if (list == null || !list.Any())
            {
                return "List of teachers cannot be empty.";
            }

            // Kiểm tra trùng lặp
            foreach (var item in list)
            {
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.UserName == item.UserName
                                           || u.Code == item.Code
                                           || u.Email == item.Email);
                if (existingUser != null)
                {
                    return $"Teacher with UserName: {item.UserName}, Code: {item.Code} or Email: {item.Email} already exists.";
                }
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var item in list)
                {
                    await AddTeacherAsync(item, saveChanges: false);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return "Thành công";
        }
    }

}
