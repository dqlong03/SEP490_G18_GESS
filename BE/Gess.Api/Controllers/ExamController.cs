using GESS.Service.exam;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExamController : ControllerBase
    {
        //Api get all exam
        private readonly IExamService _examService;
        public ExamController(IExamService examService)
        {
            _examService = examService;
        }

        [HttpGet("teacher-exams/{teacherId}")]
        public async Task<IActionResult> GetTeacherExams(
            Guid teacherId,
            int pageNumber = 1,
            int pageSize = 10,
            int? majorId = null,
            int? semesterId = null,
            int? subjectId = null,
            string? examType = null,
            string? searchName = null)
        {
            var (data, totalCount) = await _examService.GetTeacherExamsAsync(
                teacherId, pageNumber, pageSize, majorId, semesterId, subjectId, examType, searchName);

            return Ok(new
            {
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                Data = data
            });
        }
    }
}
