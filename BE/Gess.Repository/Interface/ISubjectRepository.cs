using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Subject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface ISubjectRepository : IBaseRepository<Subject>
    {
        Task<IEnumerable<Subject>> GetAllSubjectsAsync(string? name = null, int pageNumber = 1, int pageSize = 10);
        // Create subject
        Task<Subject> CreateSubjectAsync(SubjectCreateDTO subjectCreateDTO);
        // Update subject
        Task<Subject> UpdateSubjectAsync(int subjectId, SubjectDTO subjectUpdateDTO);
        // Add subject to training program
        Task<bool> AddSubjectToTrainingProgramAsync(int trainingProgramId, int subjectId);
        // View subjects in training program
        Task<IEnumerable<Subject>> GetSubjectsInTrainingProgramAsync(int trainingProgramId, string? name = null, int pageNumber = 1, int pageSize = 10);
        // Remove subject from training program
        Task<bool> RemoveSubjectFromTrainingProgramAsync(int trainingProgramId, int subjectId);
        Task<int> CountPageAsync(string? name, int pageSize);
        Task<IEnumerable<Subject>> GetAllSubjectsByMajorId(int? majorId);

        // ThaiNH_add_UpdateMark&UserProfile_Begin
        Task<Subject?> GetSubjectBySubIdAsync(int subjectId);
        // ThaiNH_add_UpdateMark&UserProfile_End

    }
}
