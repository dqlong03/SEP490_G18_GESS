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
        //API to get exam schedule by exam slot id
        [HttpGet("slots/{examSlotId}")]
        public async Task<IActionResult> GetExamScheduleByExamSlotId(int examSlotId)
        {
            var examSlots = await _examScheduleService.GetExamBySlotIdsAsync(examSlotId);
            if (examSlots == null)
            {
                return NotFound($"No exam slot found with ID {examSlotId}.");
            }
            return Ok(examSlots);
        }
        //API to get all student by exam slot id
        [HttpGet("students/{examSlotId}")]
        public async Task<IActionResult> GetStudentsByExamSlotId(int examSlotId)
        {
            var students = await _examScheduleService.GetStudentsByExamSlotIdAsync(examSlotId);
            if (students == null || !students.Any())
            {
                return NotFound($"No students found for exam slot ID {examSlotId}.");
            }
            return Ok(students);
        }
        //API to check in student by exam slot id and student id
        [HttpPost("checkin")]
        public async Task<IActionResult> CheckInStudent(int examSlotId, Guid studentId)
        {
            var result = await _examScheduleService.CheckInStudentAsync(examSlotId, studentId);
            if (!result)
            {
                return BadRequest("Failed to check in the student. Please ensure the exam slot and student ID are valid.");
            }
            return Ok("Student checked in successfully.");
        }
        //API to refresh exam code
        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshExamCode(int examSlotId)
        {
            var result = await _examScheduleService.RefreshExamCodeAsync(examSlotId);
            if (string.IsNullOrEmpty(result))
            {
                return BadRequest("Failed to refresh exam code. Please try again.");
            }
            return Ok(new { ExamCode = result, Message = "Exam code refreshed successfully." });
        }
        //API to change status of exam by exam slot room id for final exam
        [HttpPost("changestatus")]
        public async Task<IActionResult> ChangeExamStatus(int examSlotRoomId, int status)
        {
            var examSlotRoom = await _examScheduleService.GetByIdAsync(examSlotRoomId);
            if (examSlotRoom == null)
            {
                return NotFound($"No exam slot room found with ID {examSlotRoomId}.");
            }
            examSlotRoom.Status = status;   

           //var updateExamStatus = await _examScheduleService.ChangeExamStatusBySlotRoomIdAsync(examSlotRoomId, status==1?"Đang mở ca":"Đã đóng ca");

            var isUpdated = await _examScheduleService.UpdateAsync(examSlotRoom);
            if (!isUpdated)
            {
                return BadRequest("Failed to change exam status. Please try again.");
            }
            return Ok("Exam status changed successfully.");
        }
    }
}