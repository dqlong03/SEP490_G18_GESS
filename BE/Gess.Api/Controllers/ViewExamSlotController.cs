using DocumentFormat.OpenXml.Wordprocessing;
using GESS.Model.ExamSlot;
using GESS.Model.ExamSlotCreateDTO;
using GESS.Model.MultipleExam;
using GESS.Model.PracticeExam;
using GESS.Model.RoomDTO;
using GESS.Model.Student;
using GESS.Model.Teacher;
using GESS.Service.assignGradeCreateExam;
using GESS.Service.examSlotService;
using GESS.Service.finalPracExam;
using GESS.Service.multipleQuestion;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using static GESS.Model.PracticeExam.PracticeExamCreateDTO;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ViewExamSlotController : ControllerBase
    {
        private readonly IExamSlotService _examSlotService;
        public ViewExamSlotController(IExamSlotService examSlotService)
        {
            _examSlotService = examSlotService;

        }
        //API to gte all major 
        [HttpGet("GetAllMajor")]
        public async Task<IActionResult> GetAllMajor()
        {
            var result = await _examSlotService.GetAllMajor();
            if (result == null)
            {
                return NotFound("No majors found.");
            }
            return Ok(result);
        }
        //API to get all subjects by major id
        [HttpGet("GetAllSubjectsByMajorId/{majorId}")]
        public async Task<IActionResult> GetAllSubjectsByMajorId(int majorId)
        {
            var subjects = await _examSlotService.GetAllSubjectsByMajorId(majorId);
            if (subjects == null)
            {
                return NotFound("No majors found.");
            }
            return Ok(subjects);

        }
        //API to get all exam slot by subject id, semeester id, year, status, exam slot name, exam type, from date and to date need pagination
        [HttpGet("GetAllExamSlotsPagination")]
        public async Task<IActionResult> GetAllExamSlotsPagination([FromQuery] ExamSlotFilterRequest filterRequest, int pageSize=10, int pageIndex=1 )
        {
            var examSlots = await _examSlotService.GetAllExamSlotsPagination(filterRequest,pageIndex,pageSize);
            if (examSlots == null || !examSlots.Any())
            {
                return NotFound("No exam slots found.");
            }
            return Ok(examSlots);
        }
        //API to count number of page  
        [HttpGet("CountPage")]
        public async Task<IActionResult> CountPage([FromQuery] ExamSlotFilterRequest filterRequest, int pageSize = 10)
        {
            var pageNumber = await _examSlotService.CountPageExamSlots(filterRequest, pageSize);
            if (pageNumber == null)
            {
                return NotFound("No exam slots found.");
            }
            return Ok(pageNumber);
        }
        //API to get exam slot by id
        [HttpGet("GetExamSlotById/{examSlotId}")]
        public async Task<IActionResult> GetExamSlotById(int examSlotId)
        {
            var examSlot = await _examSlotService.GetExamSlotById(examSlotId);
            if (examSlot == null)
            {
                return NotFound("Exam slot not found.");
            }
            return Ok(examSlot);
        }
        //API to add exam to exam slot
        [HttpPost("AddExamToExamSlot")]
        public async Task<IActionResult> AddExamToExamSlot(int examSlotId, int examId, string examType)
        {
            var result = await _examSlotService.AddExamToExamSlot(examSlotId, examId, examType);
            if (!result)
            {
                return BadRequest("Failed to save exam slots.");
            }
            return Ok("Exam slots saved successfully.");
        }
        //Change status of exam slot => "Mở ca"
        [HttpPost("ChangeStatusExamSlot")]
        public async Task<IActionResult> ChangeStatusExamSlot(int examSlotId, string examType)
        {
            var examSlot = await _examSlotService.ChangeStatusExamSlot(examSlotId, examType);
            if (!examSlot)
            {
                return BadRequest("Failed to change status of exam slot.");
            }
            return Ok("Status changed successfully.");
        }
        //API to get all exam  by semester id, subject id, exam type
        [HttpGet("GetAllExams")]
        public async Task<IActionResult> GetAllExams(int semesterId, int subjectId, string examType, int year)
        {
            var exams = await _examSlotService.GetAllExams(semesterId, subjectId, examType, year);
            if (exams == null || !exams.Any())
            {
                return NotFound("No exams found.");
            }
            return Ok(exams);
        }
    }
}
