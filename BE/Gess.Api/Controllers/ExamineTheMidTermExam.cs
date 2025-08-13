using GESS.Entity.Entities;
using GESS.Service.examSchedule;
using GESS.Service.examSlotService;
using GESS.Service.multipleExam;
using GESS.Service.practiceExam;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExamineTheMidTermExamController : ControllerBase
    {
        private readonly IMultipleExamService _multipleExamService;
        private readonly IPracticeExamService _practiceExamService;
        private readonly IExamScheduleService _examScheduleService;
        private readonly IExamSlotService _examSlotService;
        public ExamineTheMidTermExamController(IMultipleExamService multipleExamService, IPracticeExamService practiceExamService, IExamScheduleService examScheduleService, IExamSlotService examSlotService)
        {
            _examScheduleService = examScheduleService;
            _examSlotService = examSlotService;
            _multipleExamService = multipleExamService;
            _practiceExamService = practiceExamService;
        }

        // API to get all student exam schedule by teacherId and examId
        [HttpGet("slots/{teacherId}/{examId}")]
        public async Task<IActionResult> GetAllStudentByExamSlotId(Guid teacherId, int examId, int examType)
        {
            if (examType != 1 && examType != 2)
            {
                return BadRequest("Invalid examType. Allowed values are 1 (Multi Mid Term) or 2 (Practical Mid Term).");
            }

            object examSlots;

            try
            {
                if (examType == 1)
                {
                    examSlots = await _examScheduleService.GetMultiMidTermExamBySlotIdsAsync(teacherId, examId);
                }
                else
                {
                    examSlots = await _examScheduleService.GetPracMidTermExamBySlotIdsAsync(teacherId, examId);
                }

                return Ok(examSlots);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving exam schedules.");
            }
        }

        //API to check in student by exam slot id and student id
        [HttpPost("checkin")]
        public async Task<IActionResult> CheckInStudent(int examId, Guid studentId, int examType)
        {
            var result = await _examScheduleService.MidTermCheckInStudentAsync(examId, studentId, examType);
            if (!result)
            {
                return BadRequest("Failed to check in the student. Please ensure the exam slot and student ID are valid.");
            }
            return Ok("Student checked in successfully.");
        }
        //API to refresh exam code
        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshExamCode(int examId, int examType)
        {
            var result = await _examScheduleService.RefreshMidTermExamCodeAsync(examId, examType);
            if (string.IsNullOrEmpty(result))
            {
                return BadRequest("Failed to refresh exam code. Please try again.");
            }
            return Ok(new { ExamCode = result, Message = "Exam code refreshed successfully." });
        }

        //API to change status of exam by exam id for midterm exam
        [HttpPost("changestatus")]
        public async Task<IActionResult> ChangeMidTermExamStatus(int examId, string status,int examType)
        {
            if(examType != 1 && examType != 2)
            {
                return BadRequest("Invalid examType. Allowed values are 1 (Multi Mid Term) or 2 (Practical Mid Term).");
            }
            if (examType==1)
            {
                var multiExam = await _multipleExamService.GetByIdAsync(examId);
                if (multiExam == null)
                {
                    return NotFound($"No multiple exam found with ID {examId}.");
                }
                multiExam.Status = status;
                //Trắc nghiệm sau khi coi thi chuyển trạng thái bài là đã chấm luôn
                if(status.Equals("Đã đóng ca", StringComparison.OrdinalIgnoreCase))
                    multiExam.IsGraded = 1;

                var isUpdated = await _multipleExamService.UpdateAsync(multiExam);
                if (!isUpdated)
                {
                    return BadRequest("Failed to change exam status. Please try again.");
                }
            }
            else
            {
                var pracExam = await _practiceExamService.GetByIdAsync(examId);
                if (pracExam == null)
                {
                    return NotFound($"No practice exam found with ID {examId}.");
                }
                pracExam.Status = status;

                var isUpdated = await _practiceExamService.UpdateAsync(pracExam);
                if (!isUpdated)
                {
                    return BadRequest("Failed to change exam status. Please try again.");
                }
            }
            return Ok("Exam status changed successfully.");
        }
    }
}