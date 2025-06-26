using GESS.Service.examSchedule;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExamScheduleController : ControllerBase
    {
        private readonly IExamScheduleService _examScheduleService;
        public ExamScheduleController(IExamScheduleService examScheduleService)
        {
            _examScheduleService = examScheduleService;
        }
        //API to get exam schedule of teacher in from date to end date
        [HttpGet("teacher/{teacherId}")]
        public async Task<IActionResult> GetExamScheduleByTeacherId(Guid teacherId, DateTime fromDate, DateTime toDate)
        {
            var examSchedules = await _examScheduleService.GetExamScheduleByTeacherIdAsync(teacherId, fromDate, toDate);
            if (examSchedules == null || !examSchedules.Any())
            {
                return NotFound("No exam schedules found for the specified teacher and date range.");
            }
            return Ok(examSchedules);
        }



    }
}