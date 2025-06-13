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
    public class ExaminationRepository : IExaminationRepository
    {
        private readonly GessDbContext _context;
        private readonly UserManager<User> _userManager;
        public ExaminationRepository(GessDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<ExaminationResponse> AddExaminationAsync(Guid userId, ExaminationCreationRequest request)
        {
            var examination = new ExamService
            {
                UserId = userId,
                HireDate = request.HireDate
            };

            _context.ExamServices.Add(examination);
            await _context.SaveChangesAsync();

            // Lấy lại entity vừa thêm
            var entity = await _context.ExamServices
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.ExamServiceId == examination.ExamServiceId);

            return new ExaminationResponse
            {
                ExaminationId = entity.ExamServiceId,
                UserName = examination.User.UserName,
                Email = examination.User.Email,
                PhoneNumber = examination.User.PhoneNumber,
                DateOfBirth = examination.User.DateOfBirth,
                Fullname = examination.User.Fullname,
                Gender = examination.User.Gender,
                IsActive = examination.User.IsActive,
                HireDate = examination.HireDate,
            };
        }


        public Task<int> CountPageAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize)
        {
            //Code repository for CountPageasync
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

        public async Task DeleteExaminationAsync(Guid examinationId)
        {
            var examination = await _context.ExamServices.FirstOrDefaultAsync(t => t.ExamServiceId == examinationId);
            if (examination != null)
            {
                _context.ExamServices.Remove(examination);
                await _context.SaveChangesAsync();
            }
        }


        public async Task<List<ExaminationResponse>> GetAllExaminationsAsync(bool? active, string? name = null, DateTime? fromDate = null, DateTime? toDate = null, int pageNumber = 1, int pageSize = 10)
        {
            var query = _context.ExamServices
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
                query = query.Where(e => e.HireDate >= fromDate.Value);
            }
            if (toDate.HasValue)
            {
                query = query.Where(e => e.HireDate <= toDate.Value);
            }

            // Pagination
            query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);

            return await query.Select(examination => new ExaminationResponse
            {
                ExaminationId = examination.ExamServiceId,
                UserName = examination.User.UserName,
                Email = examination.User.Email,
                PhoneNumber = examination.User.PhoneNumber,
                DateOfBirth = examination.User.DateOfBirth,
                Fullname = examination.User.Fullname,
                Gender = examination.User.Gender,
                IsActive = examination.User.IsActive,
                HireDate = examination.HireDate,
            }).ToListAsync();
        }

        public async Task<ExaminationResponse> GetExaminationByIdAsync(Guid examinationId)
        {
            var examination = await _context.ExamServices
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.ExamServiceId == examinationId);

            if (examination == null) return null;

            return new ExaminationResponse
            {
                ExaminationId = examination.ExamServiceId,
                UserName = examination.User.UserName,
                Email = examination.User.Email,
                PhoneNumber = examination.User.PhoneNumber,
                DateOfBirth = examination.User.DateOfBirth,
                Gender = examination.User.Gender,
                IsActive = examination.User.IsActive,
                HireDate = examination.HireDate,
            };
        }

        public async Task<List<ExaminationResponse>> SearchExaminationsAsync(string keyword)
        {
            keyword = keyword?.ToLower() ?? "";
            var examinations = await _context.ExamServices
                .Include(t => t.User)
                .Where(t =>
                    t.User.UserName.ToLower().Contains(keyword) ||
                    t.User.Email.ToLower().Contains(keyword) ||
                    t.User.Fullname.ToLower().Contains(keyword) ||
                    t.User.PhoneNumber.ToLower().Contains(keyword)
                )
                .ToListAsync();

            return examinations.Select(examination => new ExaminationResponse
            {
                ExaminationId = examination.ExamServiceId,
                UserName = examination.User.UserName,
                Email = examination.User.Email,
                PhoneNumber = examination.User.PhoneNumber,
                DateOfBirth = examination.User.DateOfBirth,
                Fullname = examination.User.Fullname,
                Gender = examination.User.Gender,
                IsActive = examination.User.IsActive,
                HireDate = examination.HireDate,
            }).ToList();
        }

        public async Task<ExaminationResponse> UpdateExaminationAsync(Guid examinationId, ExaminationUpdateRequest request)
        {
            var existing = await _context.ExamServices
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.ExamServiceId == examinationId);

            if (existing == null)
            {
                throw new Exception("Examination not found");
            }

            if (existing.User == null)
            {
                throw new Exception("Associated User not found for the Examination");
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

            // Cập nhật HireDate
            //existing.HireDate = request.HireDate ?? existing.HireDate;

            await _context.SaveChangesAsync();

            return new ExaminationResponse
            {
                ExaminationId = existing.ExamServiceId,
                UserName = existing.User.UserName,
                Email = existing.User.Email,
                PhoneNumber = existing.User.PhoneNumber,
                DateOfBirth = existing.User.DateOfBirth,
                Fullname = existing.User.Fullname,
                Gender = existing.User.Gender,
                IsActive = existing.User.IsActive,
                HireDate = existing.HireDate,
            };
        }
    }
}