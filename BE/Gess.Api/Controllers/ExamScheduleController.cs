using GESS.Service.examSchedule;
using GESS.Service.examSlotService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExamScheduleController : ControllerBase
    {
        private readonly IExamScheduleService _examScheduleService;
        private readonly IExamSlotService _examSlotService;
        public ExamScheduleController(IExamScheduleService examScheduleService, IExamSlotService examSlotService)
        {
            _examScheduleService = examScheduleService;
            _examSlotService = examSlotService;
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
        //API to get all exam slots
        [HttpGet("slots")]
        public async Task<IActionResult> GetAllExamSlots()
        {
            var examSlots = await _examSlotService.GetAllExamSlotsAsync();
            if (examSlots == null || !examSlots.Any())
            {
                return NotFound("No exam slots found.");
            }
            return Ok(examSlots);
        }

    }
}