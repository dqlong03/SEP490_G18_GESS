using GESS.Model.Examination;
using GESS.Model.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IExaminationRepository
    {
        Task<ExaminationResponse> GetExaminationByIdAsync(Guid examinationId);
        Task<List<ExaminationResponse>> GetAllExaminationsAsync(bool? active, string? name = null, DateTime? fromDate = null, DateTime? toDate = null, int pageNumber = 1, int pageSize = 10);
        Task<ExaminationResponse> AddExaminationAsync(Guid userId, ExaminationCreationRequest request);
        Task<ExaminationResponse> UpdateExaminationAsync(Guid examinationId, ExaminationUpdateRequest request);
        Task DeleteExaminationAsync(Guid examinationId);
        Task<List<ExaminationResponse>> SearchExaminationsAsync(string keyword);
        Task<int> CountPageAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize);
    }
}
