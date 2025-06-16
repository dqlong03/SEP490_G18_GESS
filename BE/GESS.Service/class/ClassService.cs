using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Chapter;
using GESS.Model.Class;
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

     
        public async Task<ClassCreateDTO> CreateClassAsync(ClassCreateDTO classCreateDto)
        {
            try
            {
                // Kiểm tra xem lớp học đã tồn tại chưa
                var classExists = await _unitOfWork.ClassRepository.ClassExistsAsync(classCreateDto.ClassName);
                if (classExists)
                {
                    throw new Exception("Lớp học đã tồn tại.");
                }

                // Tạo thực thể lớp học mới
                var classEntity = new Class
                {
                    ClassName = classCreateDto.ClassName,
                    TeacherId = classCreateDto.TeacherId,
                    SubjectId = classCreateDto.SubjectId,
                    SemesterId = classCreateDto.SemesterId,
                    ClassStudents = new List<ClassStudent>()
                };

                // Xử lý từng sinh viên trong DTO
                foreach (var studentDto in classCreateDto.Students)
                {
                    Guid studentId;

                    if (studentDto.StudentId.HasValue)
                    {
                        // Trường hợp 1: Sinh viên đã tồn tại
                        studentId = studentDto.StudentId.Value;
                        var existingStudent =  _unitOfWork.StudentRepository.GetById(studentId);
                        if (existingStudent == null)
                        {
                            throw new Exception($"Sinh viên với ID {studentId} không tồn tại.");
                        }
                    }
                    else
                    {
                        // Trường hợp 2: Sinh viên mới, kiểm tra hoặc tạo User trước
                        if (string.IsNullOrEmpty(studentDto.Email))
                        {
                            throw new Exception("Email là bắt buộc đối với sinh viên mới.");
                        }

                        // Kiểm tra xem User đã tồn tại qua email
                        var existingUser = await _unitOfWork.UserRepository.IsEmailRegisteredAsync(studentDto.Email);
                        Guid userId;

                        if (existingUser == null)
                        {
                            // Tạo User mới
                            var newUser = new User
                            {
                                Id = Guid.NewGuid(),
                                Email = studentDto.Email,
                                UserName = studentDto.Email, // UserName mặc định là email
                                Fullname = studentDto.FullName ?? "Không xác định",
                                Gender = studentDto.Gender ?? true, // Mặc định là true nếu null
                                DateOfBirth = studentDto.DateOfBirth,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow,
                                IsActive = true,
                                IsDeleted = false
                            };
                            await _unitOfWork.UserRepository.CreateAsync(newUser);
                            userId = newUser.Id;
                        }
                        else
                        {
                          
                            // Lấy user theo email
                            var user = await _unitOfWork.UserRepository.GetByEmailAsync(studentDto.Email);
                            if (user == null)
                                throw new Exception("Không tìm thấy user với email đã đăng ký.");
                            userId = user.Id;
                        }

                        // Kiểm tra xem Student đã tồn tại cho User này chưa
                        var existingStudent = _unitOfWork.StudentRepository.GetById(userId);
                        if (existingStudent == null)
                        {
                            // Tạo Student mới
                            var newStudent = new Student
                            {
                                StudentId = Guid.NewGuid(),
                                UserId = userId,
                                CohortId = studentDto.CohirtId ?? 1, // Niên khóa mặc định nếu null
                                EnrollDate = DateTime.UtcNow
                            };
                             _unitOfWork.StudentRepository.Create(newStudent);
                            studentId = newStudent.StudentId;
                        }
                        else
                        {
                            studentId = existingStudent.StudentId;
                        }
                    }

                    // Thêm sinh viên vào lớp học qua ClassStudent
                    classEntity.ClassStudents.Add(new ClassStudent
                    {
                        StudentId = studentId
                    });
                }

                // Lưu lớp học
                 _unitOfWork.ClassRepository.Create(classEntity);
                await _unitOfWork.SaveChangesAsync();

                return classCreateDto;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo lớp học: {ex.Message}", ex);
            }
        }


        public async Task<IEnumerable<ClassListDTO>> GetAllClassAsync(string? name = null, int pageNumber = 1, int pageSize = 10)
        {
            var classes = await _unitOfWork.ClassRepository.GetAllClassAsync(name, pageNumber, pageSize);

            var classDtos = classes.Select(c => new ClassListDTO
            {
                ClassId = c.ClassId,
                ClassName = c.ClassName,
                SemesterName = c.Semester.SemesterName,
                SubjectName = c.Subject?.SubjectName ?? "N/A"
            });

            return classDtos;
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
    }
}
