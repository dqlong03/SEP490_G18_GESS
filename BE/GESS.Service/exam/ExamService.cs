using GESS.Model.Exam;
using GESS.Repository.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.exam
{
    public class ExamService : IExamService
    {
        private readonly IExamRepository _examRepository;
        public ExamService(IExamRepository examRepository)
        {
            _examRepository = examRepository;
        }

        public async Task<(List<ExamListResponse> Data, int TotalCount)> GetTeacherExamsAsync(
            Guid teacherId,
            int pageNumber,
            int pageSize,
            int? majorId,
            int? semesterId,
            int? subjectId,
            string? examType,
            string? searchName)
        {
            return await _examRepository.GetTeacherExamsAsync(
                teacherId, pageNumber, pageSize, majorId, semesterId, subjectId, examType, searchName);
        }
    }

}
