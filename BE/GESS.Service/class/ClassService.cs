using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Chapter;
using GESS.Model.Class;
using GESS.Model.GradeComponent;
using GESS.Model.Student;
using GESS.Model.Subject;
using Microsoft.AspNet.Identity;
using Microsoft.AspNetCore.Identity;
using Org.BouncyCastle.Asn1.Ocsp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service
{
    public class ClassService : BaseService<Class>, IClassService
    {
        private readonly IUnitOfWork _unitOfWork;
        public ClassService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<int?> GetSemesterIdByClassIdAsync(int classId)
        {
            return await _unitOfWork.ClassRepository.GetSemesterIdByClassIdAsync(classId);
        }


        
        public async Task<IEnumerable<StudentExamScoreDTO>> GetStudentScoresByExamAsync(int examId, int examType)
        {
            return await _unitOfWork.ClassRepository.GetStudentScoresByExamAsync(examId, examType);
        }


        public async Task<int?> GetSubjectIdByClassIdAsync(int classId)
        {
            return await _unitOfWork.ClassRepository.GetSubjectIdByClassIdAsync(classId);
        }

        public async Task<IEnumerable<StudentInClassDTO>> GetStudentsByClassIdAsync(int classId)
        {
            return await _unitOfWork.ClassRepository.GetStudentsByClassIdAsync(classId);
        }


        public async Task<IEnumerable<GradeComponentDTO>> GetGradeComponentsByClassIdAsync(int classId)
        {
            return await _unitOfWork.ClassRepository.GetGradeComponentsByClassIdAsync(classId);
        }

        public async Task<IEnumerable<ChapterInClassDTO>> GetChaptersByClassIdAsync(int classId)
        {
            return await _unitOfWork.ClassRepository.GetChaptersByClassIdAsync(classId);
        }


        public async Task<ClassDetailResponseDTO?> GetClassDetailAsync(int classId)
        {
            // Gọi repository qua unit of work, không tạo repository trực tiếp
            return await _unitOfWork.ClassRepository.GetClassDetailAsync(classId);
        }

        //




        public async Task<ClassCreateDTO> CreateClassAsync(ClassCreateDTO classCreateDto)
        {
            using var transaction = await _unitOfWork.DataContext.Database.BeginTransactionAsync();
            try
            {
                // Kiểm tra xem lớp học đã tồn tại chưa
                //var classExists = await _unitOfWork.ClassRepository.ClassExistsAsync(classCreateDto.ClassName);
                //if (classExists)
                //{
                //    throw new Exception("Lớp học đã tồn tại.");
                //}

                // Tạo thực thể lớp học mới
                var classEntity = new Class
                {
                    ClassName = classCreateDto.ClassName,
                    TeacherId = classCreateDto.TeacherId,
                    SubjectId = classCreateDto.SubjectId,
                    SemesterId = classCreateDto.SemesterId,
                    CreatedDate = DateTime.Now,
                    ClassStudents = new List<ClassStudent>()
                };

                foreach (var studentDto in classCreateDto.Students)
                {
                    // Kiểm tra đầy đủ thông tin
                    if (string.IsNullOrEmpty(studentDto.Email) || string.IsNullOrEmpty(studentDto.Code))
                    {
                        throw new Exception("Email và mã sinh viên là bắt buộc.");
                    }

                    // Tìm user theo Code và Email
                    var existingUser = await _unitOfWork.UserRepository.GetByCodeAndEmailAsync(studentDto.Code, studentDto.Email);
                    Guid userId;

                    if (existingUser == null)
                    {
                        var passWordHash = _unitOfWork.UserManager.PasswordHasher.HashPassword(null, "Password123!");
                        var newUser = new User
                        {
                            Id = Guid.NewGuid(),
                            Email = studentDto.Email,
                            Code = studentDto.Code,
                            UserName = studentDto.Email,
                            Fullname = studentDto.FullName ?? "Không xác định",
                            Gender = studentDto.Gender ?? true,
                            DateOfBirth = studentDto.DateOfBirth,
                            CreatedAt = DateTime.Now,
                            UpdatedAt = DateTime.Now,
                            IsActive = true,
                            IsDeleted = false,
                            PasswordHash = passWordHash,
                            EmailConfirmed = true,
                            NormalizedUserName = studentDto.Email.ToUpper(),
                            NormalizedEmail = studentDto.Email.ToUpper(),
                            ConcurrencyStamp = Guid.NewGuid().ToString(),
                            SecurityStamp = Guid.NewGuid().ToString()
                        };

                        await _unitOfWork.UserRepository.CreateAsync(newUser);
                        
                        userId = newUser.Id;

                        // Gán vai trò "Sinh viên" cho người dùng mới
                        var roleExists = await _unitOfWork.RoleManager.RoleExistsAsync("Học sinh");
                        if (!roleExists)
                        {
                            var role = new IdentityRole<Guid>
                            {
                                Id = Guid.NewGuid(),
                                Name = "Học sinh",
                                NormalizedName = "STUDENT"
                            };
                            var roleResult = await _unitOfWork.RoleManager.CreateAsync(role);
                            if (!roleResult.Succeeded)
                            {
                                throw new Exception($"Không thể tạo vai trò Học sinh: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
                            }
                        }
                        await _unitOfWork.UserManager.AddToRoleAsync(newUser, "Học sinh");
                        // (Tùy chọn) Gửi mật khẩu qua email
                        // await _emailService.SendPasswordAsync(newUser.Email, randomPassword);
                    }
                    else
                    {
                        userId = existingUser.Id;
                    }

                    // Tìm student theo userId
                    var existingStudent = await _unitOfWork.StudentRepository.GetStudentbyUserId(userId);
                    Guid studentId;

                    if (existingStudent == null)
                    {
                        var newStudent = new Student
                        {
                            StudentId = Guid.NewGuid(),
                            UserId = userId,
                            EnrollDate = DateTime.Now,
                            AvatarURL = studentDto.Avartar
                        };
                        _unitOfWork.StudentRepository.Create(newStudent);
                        studentId = newStudent.StudentId;
                    }
                    else
                    {
                        studentId = existingStudent.StudentId;
                    }

                    // Thêm vào class
                    classEntity.ClassStudents.Add(new ClassStudent
                    {
                        StudentId = studentId,
                        ClassId = classEntity.ClassId // Đảm bảo ClassId được gán sau khi tạo
                    });
                }

                // Lưu lớp học
                _unitOfWork.ClassRepository.Create(classEntity);
                await _unitOfWork.SaveChangesAsync();
                await transaction.CommitAsync();

                return classCreateDto;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception($"Lỗi khi tạo lớp học: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<ClassListDTO>> GetAllClassAsync(string? name = null, int? subjectId = null, int? semesterId = null, int pageNumber = 1, int pageSize = 5)
        {
            return await _unitOfWork.ClassRepository.GetAllClassAsync(name,subjectId,semesterId, pageNumber, pageSize);
        }

        public async Task<int> CountPageAsync(string? name = null, int? subjectId = null, int? semesterId = null, int pageSize = 5)
        {
            return await _unitOfWork.ClassRepository.CountPageAsync(name, subjectId, semesterId, pageSize);
        }

        public Task<ClassUpdateDTO> UpdateClassAsync(int ClassId, ClassUpdateDTO classUpdateDto)
        {
            var classEs = _unitOfWork.ClassRepository.GetById(ClassId);
            if (classEs == null)
            {
                throw new Exception("Lớp học không tồn tại.");
            }
            classEs.ClassName = classUpdateDto.ClassName;
            classEs.TeacherId = classUpdateDto.TeacherId;
            classEs.SubjectId = classUpdateDto.SubjectId;
            classEs.SemesterId = classUpdateDto.SemesterId;

            _unitOfWork.ClassRepository.Update(classEs);
            _unitOfWork.SaveChangesAsync().Wait();
            return Task.FromResult(new ClassUpdateDTO
            {
              
                ClassName = classEs.ClassName,
                TeacherId = classEs.TeacherId,
                SubjectId = classEs.SubjectId,
                SemesterId = classEs.SemesterId
            });


        }

        public async Task<IEnumerable<ClassListDTO>> GetAllClassByTeacherIdAsync(Guid teacherId, string? name = null, int? subjectId = null, int? semesterId = null, int pageNumber = 1, int pageSize = 5, int? year = null)
        {
            return await _unitOfWork.ClassRepository.GetAllClassByTeacherIdAsync(teacherId,name, subjectId, semesterId, pageNumber, pageSize,year);
        }

        public async Task<int> CountPageByTeacherAsync(Guid teacherId, string? name = null, int? subjectId = null, int? semesterId = null, int pageSize = 5, int? year = null)
        {
            return await _unitOfWork.ClassRepository.CountPageByTeacherAsync(teacherId, name, subjectId, semesterId, pageSize, year);
        }
        public async Task AddStudentsToClassAsync(AddStudentsToClassRequest request)
        {
            using var transaction = await _unitOfWork.DataContext.Database.BeginTransactionAsync();
            try
            {
                var classEntity = await _unitOfWork.ClassRepository.GetByIdAsync(request.ClassId);
                if (classEntity == null)
                    throw new Exception("Lớp học không tồn tại.");

                var duplicateStudents = new List<string>();

                foreach (var studentDto in request.Students)
                {
                    if (string.IsNullOrEmpty(studentDto.Email) || string.IsNullOrEmpty(studentDto.Code))
                        throw new Exception("Email và mã sinh viên là bắt buộc.");

                    var existingUser = await _unitOfWork.UserRepository.GetByCodeAndEmailAsync(studentDto.Code, studentDto.Email);
                    Guid userId;

                    if (existingUser == null)
                    {
                        var newUser = new User
                        {
                            Id = Guid.NewGuid(),
                            Email = studentDto.Email,
                            Code = studentDto.Code,
                            UserName = studentDto.Email,
                            Fullname = studentDto.FullName ?? "Không xác định",
                            Gender = studentDto.Gender ?? true,
                            DateOfBirth = studentDto.DateOfBirth,
                            CreatedAt = DateTime.Now,
                            UpdatedAt = DateTime.Now,
                            IsActive = true,
                            IsDeleted = false,
                            NormalizedUserName = studentDto.Email.ToUpper(),
                            NormalizedEmail = studentDto.Email.ToUpper(),
                            EmailConfirmed = true,
                            ConcurrencyStamp = Guid.NewGuid().ToString(),
                            SecurityStamp = Guid.NewGuid().ToString()
                        };

                        var passwordHash = _unitOfWork.UserManager.PasswordHasher.HashPassword(newUser, "Password123!");
                        var result = await _unitOfWork.UserManager.CreateAsync(newUser, passwordHash);
                        if (!result.Succeeded)
                        {
                            throw new Exception($"Không thể tạo người dùng: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                        }
                       
                        userId = newUser.Id;

                        // Gán vai trò "Student" cho người dùng mới
                        var roleExists = await _unitOfWork.RoleManager.RoleExistsAsync("Sinh viên");
                        if (!roleExists)
                        {
                            var role = new IdentityRole<Guid>
                            {
                                Id = Guid.NewGuid(),
                                Name = "Học sinh",
                                NormalizedName = "STUDENT"
                            };
                            var roleResult = await _unitOfWork.RoleManager.CreateAsync(role);
                            if (!roleResult.Succeeded)
                            {
                                throw new Exception($"Không thể tạo vai trò Student: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
                            }
                        }

                        await _unitOfWork.UserManager.AddToRoleAsync(newUser, "Học sinh");
                       
                    }
                    else
                    {
                        userId = existingUser.Id;
                    }

                    var existingStudent = await _unitOfWork.StudentRepository.GetStudentbyUserId(userId);
                    Guid studentId;

                    if (existingStudent == null)
                    {
                        var newStudent = new Student
                        {
                            StudentId = Guid.NewGuid(),
                            UserId = userId,
                            // CohortId = studentDto.CohortId ?? 1,
                            EnrollDate = DateTime.Now
                        };
                        _unitOfWork.StudentRepository.Create(newStudent);
                        studentId = newStudent.StudentId;
                    }
                    else
                    {
                        studentId = existingStudent.StudentId;
                    }

                    // Kiểm tra và thêm sinh viên vào lớp học
                    var isInClass = await _unitOfWork.ClassRepository.CheckIfStudentInClassAsync(classEntity.ClassId, studentId);
                    if (isInClass)
                    {
                        duplicateStudents.Add($"{studentDto.FullName ?? studentDto.Code} ({studentDto.Email})");
                    }
                    else
                    {
                        classEntity.ClassStudents.Add(new ClassStudent
                        {
                            StudentId = studentId,
                            ClassId = classEntity.ClassId
                        });
                    }
                }

                // Ném lỗi nếu có sinh viên trùng lặp
                if (duplicateStudents.Any())
                {
                    throw new Exception($"Các sinh viên đã tồn tại trong lớp: {string.Join(", ", duplicateStudents)}");
                }

                await _unitOfWork.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }


        // GESS.Service/class/ClassService.cs
        public async Task<IEnumerable<SubjectListDTO>> GetSubjectsByTeacherIdAsync(Guid teacherId)
        {
            return await _unitOfWork.ClassRepository.GetSubjectsByTeacherIdAsync(teacherId);
        }

    }
}
