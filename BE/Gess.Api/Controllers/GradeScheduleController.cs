using GESS.Model.PracticeTestQuestions;
using GESS.Model.QuestionPracExam;
using GESS.Service.examSchedule;
using GESS.Service.examSlotService;
using GESS.Service.gradeSchedule;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GradeScheduleController : ControllerBase
    {
        private readonly IGradeScheduleService _gradeScheduleService;
        public GradeScheduleController(IGradeScheduleService gradeScheduleService)
        {
            _gradeScheduleService = gradeScheduleService;
        }
        //API to get all exam need grade by teacher id paggiation
        [HttpGet("teacher")]
        public async Task<IActionResult> GetExamNeedGradeByTeacherId(
            [FromQuery] Guid teacherId,
            [FromQuery] int? subjectId,
            [FromQuery] int? statusExam,
            [FromQuery] int? semesterId,
            [FromQuery] int? year ,
            [FromQuery] int? pagesze,
            [FromQuery] int? pageindex)
        {
            // Gán giá trị mặc định nếu cần
       
            int size = pagesze ?? 10;
            int page = pageindex ?? 1;

            var result = await _gradeScheduleService.GetExamNeedGradeByTeacherIdAsync(
                teacherId, subjectId, statusExam, semesterId, year, size, page);

            if (result == null || !result.Any())
            {
                return NotFound("No exams found for grading.");
            }
            return Ok(result);
        }

        //API to count number of pages for exam need grade by teacher id
        [HttpGet("teacher/count")]
        public async Task<int> CountExamNeedGradeByTeacherId([FromQuery] Guid teacherId,
            [FromQuery] int? subjectId,
            [FromQuery] int? statusExam,
            [FromQuery] int? semesterId,
            [FromQuery] int? year,
            [FromQuery] int? pagesze,
            [FromQuery] int? pageindex)
        {
            return await _gradeScheduleService.CountExamNeedGradeByTeacherIdAsync(teacherId, subjectId, statusExam, semesterId, year, pagesze, pageindex);

        }
        //API to get all students in exam need grade by teacher id
        [HttpGet("teacher/{teacherId}/exam/{examId}/students")]
        public async Task<IActionResult> GetStudentsInExamNeedGrade(Guid teacherId, int examId)
        {
            var result = await _gradeScheduleService.GetStudentsInExamNeedGradeAsync(teacherId, examId);
            if (result == null || !result.Any())
            {
                return NotFound("No students found for the specified exam.");
            }
            return Ok(result);
        }
        //API to get submission of student in exam need grade by teacher id and exam id and student id
        [HttpGet("teacher/{teacherId}/exam/{examId}/student/{studentId}/submission")]
        public async Task<IActionResult> GetSubmissionOfStudentInExamNeedGrade(Guid teacherId, int examId, Guid studentId)
        {
            var result = await _gradeScheduleService.GetSubmissionOfStudentInExamNeedGradeAsync(teacherId, examId, studentId);
            if (result == null)
            {
                return NotFound("No submission found for the specified student in the exam.");
            }
            return Ok(result);
        }
        //API to save grade for student by teacher id and exam id and student id and questionId
        [HttpPost("teacher/{teacherId}/exam/{examId}/student/{studentId}/grade")]
        public async Task<IActionResult> SaveGradeForStudent(Guid teacherId, int examId, Guid studentId, [FromBody] QuestionPracExamGradeDTO questionPracExamDTO)
        {
            if (questionPracExamDTO == null|| questionPracExamDTO.GradedScore<0)
            {
                return BadRequest("Invalid submission data.");
            }
            var result = await _gradeScheduleService.GradeSubmission(teacherId, examId, studentId, questionPracExamDTO);
            if (!result)
            {
                return NotFound("No submission found for the specified student in the exam.");
            }
            return Ok("Grade saved successfully.");
        }
    }
}