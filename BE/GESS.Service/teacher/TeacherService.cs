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

        public async Task<List<TeacherResponse>> GetAllTeachersAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageNumber, int pageSize)
        {
            return await _unitOfWork.TeacherRepository.GetAllTeachersAsync(active, name, fromDate, toDate, pageNumber, pageSize);
        }

        public async Task<TeacherResponse> AddTeacherAsync(TeacherCreationRequest request)
        {
            return await _unitOfWork.TeacherRepository.AddTeacherAsync(request);


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

                    if (rowCount < 3)
                        throw new Exception("File Excel không chứa dữ liệu hợp lệ.");

                    for (int row = 3; row <= rowCount; row++) // Bỏ qua hàng tiêu đề
                    {
                        try
                        {
                            var request = new TeacherCreationRequest
                            {
                                UserName = worksheet.Cells[row, 2].Text.Trim(),
                                Email = worksheet.Cells[row, 3].Text.Trim(),
                                PhoneNumber = worksheet.Cells[row, 4].Text.Trim(),
                                DateOfBirth = DateTime.TryParse(worksheet.Cells[row, 5].Text, out var dob) ? dob : DateTime.Now,
                                Fullname = worksheet.Cells[row, 6].Text.Trim(),
                                Code = worksheet.Cells[row, 7].Text.Trim(),
                                Gender = worksheet.Cells[row, 8].Text.Trim().ToLower() == "nam" ? true :
                                         worksheet.Cells[row, 8].Text.Trim().ToLower() == "nữ" ? false :
                                         bool.TryParse(worksheet.Cells[row, 8].Text, out var parsedGender) ? parsedGender : true,
                                MajorName = worksheet.Cells[row, 9].Text.Trim()
                            };

                            
                            if (string.IsNullOrWhiteSpace(request.MajorName))
                            {
                                throw new Exception($"Hàng {row}: Tên chuyên ngành không được để trống.");
                            }
                            if (!await IsMajorValid(request.MajorName, _unitOfWork))
                            {
                                throw new Exception($"Hàng {row}: Tên chuyên ngành '{request.MajorName}' không tồn tại trong hệ thống.");
                            }
                            if (string.IsNullOrWhiteSpace(request.PhoneNumber))
                            {
                                throw new Exception($"Hàng {row}: Số điện thoại không được để trống.");
                            }

                            if (string.IsNullOrWhiteSpace(request.Fullname))
                            {
                                throw new Exception($"Hàng {row}: Họ và tên không được để trống.");
                            }

                            //Check Gender valid
                            if (worksheet.Cells[row, 8].Text.Trim().ToLower() != "nam" &&
                                worksheet.Cells[row, 8].Text.Trim().ToLower() != "nữ" &&
                                !bool.TryParse(worksheet.Cells[row, 8].Text, out _))
                            {
                                throw new Exception($"Hàng {row}: Giới tính không hợp lệ. Chỉ chấp nhận 'Nam', 'Nữ' .");
                            }

                            if (request.DateOfBirth == default)
                            {
                                throw new Exception($"Hàng {row}: Ngày sinh không được để trống.");
                            }

                            if (await IsUserNameExists(request.UserName, _unitOfWork))
                            {
                                throw new Exception($"Hàng {row}: Tên đăng nhập '{request.UserName}' đã tồn tại trong hệ thống.");
                            }

                            if (string.IsNullOrWhiteSpace(request.Code))
                            {
                                throw new Exception($"Hàng {row}: Mã giáo viên không được để trống.");
                            }

                            // Kiểm tra dữ liệu bắt buộc
                            if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Email))
                            {
                                throw new Exception($"Hàng {row}: Thiếu tên đăng nhập hoặc Email.");
                            }

                            // Gọi phương thức AddTeacherAsync để thêm giáo viên
                            var teacher = await AddTeacherAsync(request);
                            teachers.Add(teacher);
                        }
                        catch (Exception ex)
                        {
                            // Ghi log lỗi và tiếp tục xử lý hàng tiếp theo
                            throw new Exception($"Lỗi khi xử lý hàng {row}: {ex.Message}");
                        }
                    }
                }
            }

            return teachers;
        }

        private async Task<bool> IsMajorValid(string majorName, IUnitOfWork unitOfWork)
        {
            return await unitOfWork.MajorRepository.ExistsAsync(m => m.MajorName == majorName && m.IsActive);
        }
        private async Task<bool> IsUserNameExists(string userName, IUnitOfWork unitOfWork)
        {
            return await unitOfWork.TeacherRepository.ExistsAsync(t => t.User.UserName == userName && t.User.IsActive);
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
    }

}
