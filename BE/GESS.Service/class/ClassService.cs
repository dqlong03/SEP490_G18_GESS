using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
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
            var classExsts = _unitOfWork.ClassRepository.ClassExistsAsync(classCreateDto.ClassName);
            if (classExsts.Result)
            {
                throw new Exception("Class already exists.");
            }
            var classEntity = new Class
            {
                ClassName = classCreateDto.ClassName,
                TeacherId = classCreateDto.TeacherId,
                SubjectId = classCreateDto.SubjectId,
                SemesterId = classCreateDto.SemesterId,

                ClassStudents = classCreateDto.Students.Select(s => new ClassStudent
                {
                    StudentId = s.StudentId,
                }).ToList()

            };
            _unitOfWork.ClassRepository.Create(classEntity);
            await _unitOfWork.SaveChangesAsync();
            return classCreateDto;
        }

        public async Task<IEnumerable<ClassListDTO>> GetAllClassesAsync()
        {
            var classes = await _unitOfWork.ClassRepository.GetAllClassesAsync();
            return classes.Select(c => new ClassListDTO
            {
                ClassId = c.ClassId,
                ClassName = c.ClassName,
                Semester = c.Semester.SemesterName,
                SubjectName = c.Subject?.SubjectName ?? "N/A"

            }).ToList();
        }
    }
}
