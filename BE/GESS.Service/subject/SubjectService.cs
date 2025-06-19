using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Subject;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.subject
{
    public class SubjectService : BaseService<Subject>, ISubjectService
    {
        private readonly IUnitOfWork _unitOfWork;
        public SubjectService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> AddSubjectToTrainingProgramAsync(int trainingProgramId, int subjectId)
        {
            var result = await _unitOfWork.SubjectRepository.AddSubjectToTrainingProgramAsync(trainingProgramId, subjectId);
            if (!result)
            {
                throw new Exception("Lỗi khi thêm môn học vào chương trình đào tạo.");
            }
            return result;
        }

        public async Task <int> CountPageAsync(string? name, int pageSize)
        {
            var count = await _unitOfWork.SubjectRepository.CountPageAsync(name, pageSize);
            if (count <= 0)
            {
                throw new Exception("Không có dữ liệu để đếm trang.");
            }
            return count;
        }

        public async Task<SubjectDTO> CreateSubjectAsync(SubjectCreateDTO subjectCreateDTO)
        {
            var subject = await _unitOfWork.SubjectRepository.CreateSubjectAsync(subjectCreateDTO);
            if (subject == null)
            {
                throw new Exception("Lỗi khi tạo môn học.");
            }
            var subjectDto = new SubjectDTO
            {
                SubjectId = subject.SubjectId,
                SubjectName = subject.SubjectName,
                Description = subject.Description,
                Course = subject.Course,
                NoCredits = subject.NoCredits
            };
            return subjectDto;
        }

        public async Task<IEnumerable<SubjectDTO>> GetAllSubjectsAsync(string? name, int pageNumber, int pageSize)
        {
            var subjects = await _unitOfWork.SubjectRepository.GetAllSubjectsAsync(name, pageNumber, pageSize);

            var subjectDtos = subjects.Select(subject => new SubjectDTO
            {
                SubjectId = subject.SubjectId,
                SubjectName = subject.SubjectName,
                Description = subject.Description,
                Course = subject.Course,
                NoCredits = subject.NoCredits
            });

            return subjectDtos;
        }

        public async Task<IEnumerable<SubjectDTO>> GetAllSubjectsByMajorId(int? majorId)
        {
            var subjects = await _unitOfWork.SubjectRepository.GetAllSubjectsByMajorId(majorId);
            if (subjects == null || !subjects.Any())
            {
                throw new Exception("Không tìm thấy môn học cho chuyên ngành này.");
            }
            var subjectDtos = subjects.Select(subject => new SubjectDTO
            {
                SubjectId = subject.SubjectId,
                SubjectName = subject.SubjectName,
                Description = subject.Description,
                Course = subject.Course,
                NoCredits = subject.NoCredits
            });
            return subjectDtos;
        }

        public async Task<IEnumerable<SubjectDTO>> GetSubjectsInTrainingProgramAsync(int trainingProgramId, string? name = null, int pageNumber = 1, int pageSize = 10)
        {
            var subjects = await _unitOfWork.SubjectRepository.GetSubjectsInTrainingProgramAsync(trainingProgramId, name, pageNumber, pageSize);
            if (subjects == null || !subjects.Any())
            {
                throw new Exception("Không tìm thấy môn học trong chương trình đào tạo.");
            }
            var subjectDtos = subjects.Select(subject => new SubjectDTO
            {
                SubjectId = subject.SubjectId,
                SubjectName = subject.SubjectName,
                Description = subject.Description,
                Course = subject.Course,
                NoCredits = subject.NoCredits
            });
            return subjectDtos;
        }

        public async Task<IEnumerable<SubjectListDTO>> ListSubject()
        {
            var subjects = await _unitOfWork.SubjectRepository.GetAllAsync();

            return subjects.Select(s => new SubjectListDTO
            {
                SubjectId = s.SubjectId,
                SubjectName = s.SubjectName
            });
        }


        public async Task<bool> RemoveSubjectFromTrainingProgramAsync(int trainingProgramId, int subjectId)
        {
            var result = await _unitOfWork.SubjectRepository.RemoveSubjectFromTrainingProgramAsync(trainingProgramId, subjectId);
            if (!result)
            {
                throw new Exception("Lỗi khi xóa môn học khỏi chương trình đào tạo.");
            }
            return result;
        }

        public async Task<SubjectDTO> UpdateSubjectAsync(int subjectId, SubjectDTO subjectUpdateDTO)
        {
            var subject = await _unitOfWork.SubjectRepository.UpdateSubjectAsync(subjectId, subjectUpdateDTO);
            if (subject == null)
            {
                throw new Exception("Lỗi khi cập nhật môn học.");
            }
            var subjectDto = new SubjectDTO
            {
                SubjectId = subject.SubjectId,
                SubjectName = subject.SubjectName,
                Description = subject.Description,
                Course = subject.Course,
                NoCredits = subject.NoCredits
            };
            return subjectDto;
        }

        // ThaiNH_add_UpdateMark&UserProfile_Begin
        public async Task<SubjectDTO> GetSubjectBySubIdAsync(int subjectId)
        {
            var subject = await _unitOfWork.SubjectRepository.GetSubjectBySubIdAsync(subjectId);
            if (subject == null) return null;

            return new SubjectDTO
            {
                SubjectName = subject.SubjectName,
                Course = subject.Course
            };
        }
        // ThaiNH_add_UpdateMark&UserProfile_End
    }

}
