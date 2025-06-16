using Gess.Repository.Infrastructures;
using GESS.Common;
using GESS.Entity.Entities;
using GESS.Model.Student;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using OfficeOpenXml;
using Org.BouncyCastle.Asn1.Ocsp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.student
{
    public class StudentService : BaseService<Student>, IStudentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;
        public StudentService(IUnitOfWork unitOfWork, UserManager<User> userManager,
      RoleManager<IdentityRole<Guid>> roleManager)
      : base(unitOfWork) // <- If BaseService has a constructor
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<Student> AddStudentAsync(Guid id, StudentCreateDTO student)
        {
            var defaultPassword = "Abc123@";
            // 1. Tạo user
            var user = new User
            {
                UserName = student.UserName,
                Email = student.Email,
                PhoneNumber = student.PhoneNumber,
                DateOfBirth = student.DateOfBirth,
                Fullname = student.Fullname,
                Gender = student.Gender,
                IsActive = student.IsActive
            };

            var result = await _userManager.CreateAsync(user, defaultPassword);
            if (!result.Succeeded)
                throw new Exception(string.Join("; ", result.Errors.Select(e => e.Description)));

            // 2. Đảm bảo role "Student" tồn tại
            if (!await _roleManager.RoleExistsAsync(PredefinedRole.STUDENT_ROLE))
            {
                await _roleManager.CreateAsync(new IdentityRole<Guid>(PredefinedRole.STUDENT_ROLE));
            }

            // 3. Gán role cho user
            await _userManager.AddToRoleAsync(user, PredefinedRole.STUDENT_ROLE);

            // 4. Tạo Student
            var newStudent = new Student
            {
                UserId = user.Id,
                CohortId = student.CohortId,
                EnrollDate = student.EnrollDate,
                EndDate = student.EndDate
            };
            await _unitOfWork.StudentRepository.AddStudent(user.Id, newStudent);

            // 5. Lấy lại student vừa tạo
            var students = await _unitOfWork.StudentRepository.GetAllAsync();
            var createdStudent = students.LastOrDefault(s => s.User.UserName == student.UserName && s.User.Email == student.Email);
            return createdStudent;
        }

        public async Task<IEnumerable<StudentFileExcel>> StudentFileExcelsAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File không hợp lệ.");

            if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("Chỉ hỗ trợ file định dạng .xlsx.");

            var students = new List<StudentFileExcel>();
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
                            var genderText = worksheet.Cells[row, 3].Text.Trim().ToLower();
                            bool? gender = genderText switch
                            {
                                "nam" => true,
                                "nữ" or "nu" => false,
                                _ => null
                            };

                            var student = new StudentFileExcel
                            {
                                FullName = worksheet.Cells[row, 1].Text.Trim(),
                                Email = worksheet.Cells[row, 2].Text.Trim(),
                                Gender = gender,
                                DateOfBirth = DateTime.TryParse(worksheet.Cells[row, 4].Text, out var dob) ? dob : (DateTime?)null,
                                CohirtId = int.TryParse(worksheet.Cells[row, 5].Text, out var cohirtId) ? cohirtId : (int?)null
                            };

                            if (string.IsNullOrWhiteSpace(student.FullName) || string.IsNullOrWhiteSpace(student.Email))
                            {
                                Console.WriteLine($"Bỏ qua hàng {row}: Thiếu FullName hoặc Email.");
                                continue;
                            }

                            students.Add(student);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Lỗi khi đọc hàng {row}: {ex.Message}");
                            continue;
                        }
                    }
                }
            }

            return students;
        }


    }
}
