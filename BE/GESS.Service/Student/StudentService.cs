using GESS.Entity.Entities;
using Gess.Repository.Infrastructures;
using GESS.Model.Student;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GESS.Common;
using Microsoft.AspNetCore.Http;
using GESS.Model.Teacher;
using OfficeOpenXml;
using GESS.Model.Subject;
using GESS.Model.Exam;
using GESS.Service.cloudinary;

namespace GESS.Service.student
{
    public class StudentService : BaseService<Student>, IStudentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<User> _userManager;

        private readonly ICloudinaryService _cloudinaryService;
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;
        public StudentService(IUnitOfWork unitOfWork, UserManager<User> userManager,
      RoleManager<IdentityRole<Guid>> roleManager, ICloudinaryService cloudinaryService)
      : base(unitOfWork) // <- If BaseService has a constructor
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _roleManager = roleManager;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<StudentResponse> AddStudentAsync(StudentCreationRequest request, IFormFile? avatar)
        {
            var defaultPassword = "Abc123@";
            // 1. Tạo user
            var user = new User
            {
                UserName = request.UserName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                DateOfBirth = request.DateOfBirth,
                Fullname = request.Fullname,
                Gender = request.Gender,
                Code = request.Code,
                IsActive = request.IsActive
            };

            var result = await _userManager.CreateAsync(user, defaultPassword);
            if (!result.Succeeded)
                throw new Exception(string.Join("; ", result.Errors.Select(e => e.Description)));

            // 2. Đảm bảo role Student tồn tại
            if (!await _roleManager.RoleExistsAsync(PredefinedRole.STUDENT_ROLE))
            {
                await _roleManager.CreateAsync(new IdentityRole<Guid>(PredefinedRole.STUDENT_ROLE));
            }

            // 3. Gán role cho user
            await _userManager.AddToRoleAsync(user, PredefinedRole.STUDENT_ROLE);

            // 4. Upload avatar nếu có
            if (avatar != null)
            {
                request.AvatarUrl = await _cloudinaryService.UploadImageAsync(avatar, "students");
            }
            return await _unitOfWork.StudentRepository.AddStudentAsync(user.Id, request);

        }

        public async Task<int> CountPageAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize)
        {
            var count = await _unitOfWork.StudentRepository.CountPageAsync(active, name, fromDate, toDate, pageSize);
            if (count <= 0)
            {
                throw new Exception("Không có dữ liệu để đếm trang.");
            }
            return count;
        }

        public async Task<List<StudentResponse>> GetAllStudentsAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageNumber, int pageSize)
        {
            return await _unitOfWork.StudentRepository.GetAllStudentsAsync(active, name, fromDate, toDate, pageNumber, pageSize);
        }

        public async Task<StudentResponse> GetStudentByIdAsync(Guid studentId)
        {
            var student = await _unitOfWork.StudentRepository.GetStudentByIdAsync(studentId);
            if (student == null) throw new Exception("Student not found");
            return student;
        }

        public async Task<List<StudentResponse>> ImportStudentsFromExcelAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new Exception("Không có file được tải lên.");

            if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
                throw new Exception("Chỉ hỗ trợ file định dạng .xlsx.");

            var students = new List<StudentResponse>();

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
                            var request = new StudentCreationRequest
                            {
                                UserName = worksheet.Cells[row, 2].Text.Trim(),
                                Fullname = worksheet.Cells[row, 3].Text.Trim(),
                                Gender = worksheet.Cells[row, 4].Text.Trim().ToLower() == "nam",
                                DateOfBirth = DateTime.TryParse(worksheet.Cells[row, 5].Text, out var dob) ? dob : DateTime.Now,
                                Email = worksheet.Cells[row, 6].Text.Trim(),
                                PhoneNumber = worksheet.Cells[row, 7].Text.Trim(),
                                Code = worksheet.Cells[row, 8].Text.Trim(),
                            };

                            // Kiểm tra dữ liệu bắt buộc
                            if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Email))
                            {
                                Console.WriteLine($"Bỏ qua hàng {row}: Thiếu UserName hoặc Email.");
                                continue;
                            }

                            
                            var student = await AddStudentAsync(request, null);
                            students.Add(student);
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

            return students;
        }

        public async Task<List<StudentResponse>> SearchStudentsAsync(string keyword)
        {
            return await _unitOfWork.StudentRepository.SearchStudentsAsync(keyword);
        }

        public async Task<StudentResponse> UpdateStudentAsync(Guid studentId, StudentUpdateRequest request , IFormFile? avatar)
        {
            // Upload avatar nếu có
            if (avatar != null)
            {
                request.AvatarUrl = await _cloudinaryService.UploadImageAsync(avatar, "students");
            }
            await _unitOfWork.StudentRepository.UpdateStudentAsync(studentId, request);
            await _unitOfWork.SaveChangesAsync();
            var student = await _unitOfWork.StudentRepository.GetStudentByIdAsync(studentId);
            if (student == null) throw new Exception("Student not found");
            return student;
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
                Code = student.Code,
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
                            var genderText = worksheet.Cells[row, 4].Text.Trim().ToLower();
                            bool? gender = genderText switch
                            {
                                "nam" => true,
                                "nữ" or "nu" => false,
                                _ => null
                            };

                            var student = new StudentFileExcel
                            {
                                FullName = worksheet.Cells[row, 1].Text.Trim(),
                                Code = worksheet.Cells[row,2].Text.Trim(),
                                Email = worksheet.Cells[row, 3].Text.Trim(),
                                Gender = gender,
                                DateOfBirth = DateTime.TryParse(worksheet.Cells[row, 5].Text, out var dob) ? dob : (DateTime?)null,
                                
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

        public async Task<List<AllSubjectBySemesterOfStudentDTOResponse>> GetAllSubjectBySemesterOfStudentAsync(int? semesterId, int? year, Guid userId)
        {
            if (semesterId <= 0 || year <= 0 )
                throw new ArgumentException("Thông tin đầu vào không hợp lệ.");

            return await _unitOfWork.StudentRepository.GetAllSubjectBySemesterOfStudentAsync(semesterId, year, userId);
        }

        public async Task<List<int>> GetAllYearOfStudentAsync(Guid studentId)
        {
            return await _unitOfWork.StudentRepository.GetAllYearOfStudentAsync(studentId);
        }

        public async Task<List<HistoryExamOfStudentDTOResponse>> GetHistoryExamOfStudentBySubIdAsync(int? semesterId, int? year, int subjectId, Guid studentId)
        {
            return await _unitOfWork.StudentRepository.GetHistoryExamOfStudentBySubIdAsync(semesterId, year, subjectId, studentId);
        }
    }
}
