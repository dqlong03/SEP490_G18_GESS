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
    public interface ISubjectService : IBaseService<Subject>
    {
        Task<IEnumerable<SubjectDTO>> GetAllSubjectsAsync(string? name = null,int pageNumber = 1, int pageSize = 10);
        // Create subject
        Task<SubjectDTO> CreateSubjectAsync(SubjectCreateDTO subjectCreateDTO);
        //Update subject
        Task<SubjectDTO> UpdateSubjectAsync(int subjectId, SubjectDTO subjectUpdateDTO);
        //Add subject to training program
        Task<bool> AddSubjectToTrainingProgramAsync(int trainingProgramId, int subjectId);
        // View subjects in training program
        Task<IEnumerable<SubjectDTO>> GetSubjectsInTrainingProgramAsync(int trainingProgramId, string? name = null, int pageNumber = 1, int pageSize = 10);
        // Remove subject from training program
        Task<bool> RemoveSubjectFromTrainingProgramAsync(int trainingProgramId, int subjectId);
        Task <int> CountPageAsync(string? name, int pageSize);
        Task<IEnumerable<SubjectDTO>> GetAllSubjectsByMajorId(int? majorId);
        Task<IEnumerable<SubjectListDTO>> ListSubject();

        // ThaiNH_add_UpdateMark&UserProfile_Begin
        Task<SubjectDTO> GetSubjectBySubIdAsync(int subjectId);
        // ThaiNH_add_UpdateMark&UserProfile_End
    }
}
