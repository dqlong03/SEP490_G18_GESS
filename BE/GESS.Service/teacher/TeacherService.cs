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
using Microsoft.AspNetCore.Http;
using OfficeOpenXml;

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


        public async Task<List<TeacherResponse>> ImportTeachersFromExcelAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new Exception("Không có file được tải lên.");

            if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
                throw new Exception("Chỉ hỗ trợ file định dạng .xlsx.");

            var teachers = new List<TeacherResponse>();

            // Thiết lập license cho EPPlus
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets[0];
                    int rowCount = worksheet.Dimension?.Rows ?? 0;

                    if (rowCount < 2)
                        throw new Exception("File Excel không chứa dữ liệu hợp lệ.");

                    for (int row = 2; row <= rowCount; row++) // Bỏ qua hàng tiêu đề
                    {
                        try
                        {
                            var request = new TeacherCreationRequest
                            {
                                UserName = worksheet.Cells[row, 1].Text.Trim(),
                                Email = worksheet.Cells[row, 2].Text.Trim(),
                                PhoneNumber = worksheet.Cells[row, 3].Text.Trim(),
                                DateOfBirth = DateTime.TryParse(worksheet.Cells[row, 4].Text, out var dob) ? dob : DateTime.Now,
                                LastName = worksheet.Cells[row, 5].Text.Trim(),
                                FirstName = worksheet.Cells[row, 6].Text.Trim(),
                                Gender = bool.TryParse(worksheet.Cells[row, 7].Text, out var gender) ? gender : true,
                                IsActive = bool.TryParse(worksheet.Cells[row, 8].Text, out var isActive) ? isActive : true,
                                HireDate = DateTime.TryParse(worksheet.Cells[row, 9].Text, out var hireDate) ? hireDate : DateTime.Now,
                                MajorTeachers = ParseMajorTeachers(worksheet.Cells[row, 10].Text)
                            };

                            // Kiểm tra dữ liệu bắt buộc
                            if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Email))
                            {
                                Console.WriteLine($"Bỏ qua hàng {row}: Thiếu UserName hoặc Email.");
                                continue;
                            }

                            // Gọi phương thức AddTeacherAsync để thêm giáo viên
                            var teacher = await AddTeacherAsync(request);
                            teachers.Add(teacher);
                        }
                        catch (Exception ex)
                        {
                            // Ghi log lỗi và tiếp tục xử lý hàng tiếp theo
                            Console.WriteLine($"Lỗi khi xử lý hàng {row}: {ex.Message}");
                            continue;
                        }
                    }
                }
            }

            return teachers;
        }

        private List<MajorTeacher> ParseMajorTeachers(string majorIdsText)
        {
            if (string.IsNullOrWhiteSpace(majorIdsText))
                return new List<MajorTeacher>();

            var majorIds = majorIdsText.Split(',', StringSplitOptions.RemoveEmptyEntries);
            var majorTeachers = new List<MajorTeacher>();

            foreach (var id in majorIds)
            {
                if (int.TryParse(id.Trim(), out var majorId))
                {
                    majorTeachers.Add(new MajorTeacher { MajorId = majorId });
                }
            }

            return majorTeachers;
        }



    }

}
