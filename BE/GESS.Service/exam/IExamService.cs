using GESS.Model.Exam;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.exam
{
    public interface IExamService
    {
        Task<(List<ExamListResponse> Data, int TotalCount)> GetTeacherExamsAsync(
            Guid teacherId,
            int pageNumber,
            int pageSize,
            int? majorId,
            int? semesterId,
            int? subjectId,
            string? examType,
            string? searchName);
    }

}
