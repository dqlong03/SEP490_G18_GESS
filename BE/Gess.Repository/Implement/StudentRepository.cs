using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Examination;
using GESS.Model.Student;
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
    public class StudentRepository : BaseRepository<Student>, IStudentRepository
    {
        private readonly GessDbContext _context;
        private readonly UserManager<User> _userManager;
        public StudentRepository(GessDbContext context, UserManager<User> userManager)
    : base(context)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<StudentResponse> AddStudentAsync(Guid id, StudentCreationRequest request)
        {
            var student = new Student
            {
                UserId = id,
                EnrollDate = request.EnrollDate,
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            // Lấy lại entity vừa thêm
            var entity = await _context.Students
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.StudentId == student.StudentId);

            return new StudentResponse
            {
                StudentId = entity.StudentId,
                UserName = student.User.UserName,
                Email = student.User.Email,
                PhoneNumber = student.User.PhoneNumber,
                DateOfBirth = student.User.DateOfBirth,
                Fullname = student.User.Fullname,
                Gender = student.User.Gender,
                Code = student.User.Code,
                IsActive = student.User.IsActive,
                EnrollDate = student.EnrollDate,
            };
        }
        
        public Task<int> CountPageAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize)
        {
            var query = _context.ExamServices.AsQueryable();
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

        public async Task<List<StudentResponse>> GetAllStudentsAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageNumber, int pageSize)
        {
            var query = _context.Students
               .Include(t => t.User)
               .AsQueryable();

            // Filter by active status if provided
            if (active.HasValue)
            {
                query = query.Where(e => e.User.IsActive == active.Value);
            }

            // Filter by name if provided
            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(e => e.User.Fullname.ToLower().Contains(name.ToLower()));
            }

            // Filter by date range if provided
            if (fromDate.HasValue)
            {
                query = query.Where(e => e.EnrollDate >= fromDate.Value);
            }
            if (toDate.HasValue)
            {
                query = query.Where(e => e.EnrollDate <= toDate.Value);
            }

            // Pagination
            query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);

            return await query.Select(student => new StudentResponse
            {
                StudentId = student.StudentId,
                UserName = student.User.UserName,
                Email = student.User.Email,
                PhoneNumber = student.User.PhoneNumber,
                DateOfBirth = student.User.DateOfBirth,
                Fullname = student.User.Fullname,
                Gender = student.User.Gender,
                IsActive = student.User.IsActive,
                Code = student.User.Code,
                EnrollDate = student.EnrollDate,
            }).ToListAsync();
        }

        public async Task<StudentResponse> GetStudentByIdAsync(Guid studentId)
        {
            var student = await _context.Students
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.StudentId == studentId);

            if (student == null) return null;

            return new StudentResponse
            {
                StudentId = student.StudentId,
                UserName = student.User.UserName,
                Email = student.User.Email,
                PhoneNumber = student.User.PhoneNumber,
                DateOfBirth = student.User.DateOfBirth,
                Gender = student.User.Gender,
                IsActive = student.User.IsActive,
                EnrollDate = student.EnrollDate,
                Code = student.User.Code
            };
        }

        public async Task<List<StudentResponse>> SearchStudentsAsync(string keyword)
        {
            keyword = keyword?.ToLower() ?? "";
            var students = await _context.Students
                .Include(t => t.User)
                .Where(t =>
                    t.User.UserName.ToLower().Contains(keyword) ||
                    t.User.Email.ToLower().Contains(keyword) ||
                    t.User.Fullname.ToLower().Contains(keyword) ||
                    t.User.PhoneNumber.ToLower().Contains(keyword) ||
                    t.User.Code.ToLower().Contains(keyword)
                )
                .ToListAsync();

            return students.Select(examination => new StudentResponse
            {
                StudentId = examination.StudentId,
                UserName = examination.User.UserName,
                Email = examination.User.Email,
                PhoneNumber = examination.User.PhoneNumber,
                DateOfBirth = examination.User.DateOfBirth,
                Fullname = examination.User.Fullname,
                Gender = examination.User.Gender,
                IsActive = examination.User.IsActive,
                EnrollDate = examination.EnrollDate,
                Code = examination.User.Code
            }).ToList();
        }

        public async Task<StudentResponse> UpdateStudentAsync(Guid studentId, StudentUpdateRequest request)
        {
            var existing = await _context.Students
               .Include(t => t.User)
               .FirstOrDefaultAsync(t => t.StudentId == studentId);

            if (existing == null)
            {
                throw new Exception("Student not found");
            }

            if (existing.User == null)
            {
                throw new Exception("Associated User not found for the Student");
            }

            // Cập nhật thông tin User qua UserManager
            existing.User.UserName = request.UserName;
            existing.User.Email = request.Email;
            existing.User.PhoneNumber = request.PhoneNumber;
            existing.User.DateOfBirth = request.DateOfBirth ?? existing.User.DateOfBirth;
            existing.User.Fullname = request.Fullname;
            existing.User.Gender = request.Gender;
            existing.User.IsActive = request.IsActive;
            existing.User.Code = request.Code;

            var updateResult = await _userManager.UpdateAsync(existing.User);
            if (!updateResult.Succeeded)
            {
                throw new Exception(string.Join("; ", updateResult.Errors.Select(e => e.Description)));
            }

            await _context.SaveChangesAsync();

            return new StudentResponse
            {
                StudentId = existing.StudentId,
                UserName = existing.User.UserName,
                Email = existing.User.Email,
                PhoneNumber = existing.User.PhoneNumber,
                DateOfBirth = existing.User.DateOfBirth,
                Fullname = existing.User.Fullname,
                Gender = existing.User.Gender,
                IsActive = existing.User.IsActive,
                Code = existing.User.Code,
                EnrollDate = existing.EnrollDate,
            };
        }
      
        public Task<Student> GetStudentbyUserId(Guid userId)
        {
            var student = _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                throw new InvalidOperationException($"Student with UserId {userId} not found.");
            }
            return student;
        }

        public async Task AddStudent(Guid id, Student student)
        {
            var newStudent = new Student
            {
                StudentId = id,
                UserId = student.UserId,
                CohortId = student.CohortId,
                EnrollDate = student.EnrollDate
            };

            await _context.Students.AddAsync(newStudent);
            await _context.SaveChangesAsync();
        }
    }
}
