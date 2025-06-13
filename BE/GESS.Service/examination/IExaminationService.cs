using GESS.Model.Examination;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.examination
{
    public interface IExaminationService
    {
        Task<ExaminationResponse> AddExaminationAsync(ExaminationCreationRequest request);
        Task<int> CountPageAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize);
        Task DeleteExaminationAsync(Guid examinationId);
        Task<IEnumerable<ExaminationResponse>> GetAllExaminationsAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageNumber, int pageSize);
        Task<ExaminationResponse> GetExaminationByIdAsync(Guid examinationId);
        Task<List<ExaminationResponse>> ImportExaminationsFromExcelAsync(IFormFile file);
        Task<List<ExaminationResponse>> SearchExaminationsAsync(string keyword);
        Task<ExaminationResponse> UpdateExaminationAsync(Guid examinationId, ExaminationUpdateRequest request);
    }
}
