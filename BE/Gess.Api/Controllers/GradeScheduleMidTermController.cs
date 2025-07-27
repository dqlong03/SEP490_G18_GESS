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
    public class GradeScheduleMidTermController : ControllerBase
    {
        private readonly IGradeScheduleService _gradeScheduleService;
        public GradeScheduleMidTermController(IGradeScheduleService gradeScheduleService)
        {
            _gradeScheduleService = gradeScheduleService;
        }
        //API to get all exam need grade by teacher id
        [HttpGet("teacher/{teacherId}")]
        public async Task<IActionResult> GetExamNeedGradeByTeacherIdMidTermAsync(Guid teacherId, int classID, int semesterId, int year, int pagesze, int pageindex)
        {
            var result = await _gradeScheduleService.GetExamNeedGradeByTeacherIdMidTermAsync(teacherId, classID, semesterId, year, pagesze, pageindex);
            if (result == null || !result.Any())
            {
                return NotFound("No exams found for grading.");
            }
            return Ok(result);
        }

        //API to get all students in exam need grade by teacher id
        [HttpGet("teacher/{teacherId}/exam/{examId}/students")]
        public async Task<IActionResult> GetStudentsInExamNeedGrade(Guid teacherId, int classID, int ExamType)
        {
            var result = await _gradeScheduleService.GetStudentsInExamNeedGradeMidTermAsync(teacherId, classID, ExamType);
            if (result == null || !result.Any())
            {
                return NotFound("No students found for the specified exam.");
            }
            return Ok(result);
        }
        //API to get submission of student in exam need grade by teacher id and exam id and student id
        [HttpGet("teacher/{teacherId}/exam/{examId}/student/{studentId}/submission")]
        public async Task<IActionResult> GetSubmissionOfStudentInExamNeedGradeMidTerm(Guid teacherId, int examId, Guid studentId, [FromQuery] int examType)
        {
            if (examType < 1 || examType > 3)
            {
                return BadRequest("Invalid exam type. It must be between 1 and 3.");
            }

            object result;

            if (examType == 2)
            {
                result = await _gradeScheduleService.GetSubmissionOfStudentInExamNeedGradeMidTerm(teacherId, examId, studentId);
            }
            else
            {
                result = await _gradeScheduleService.GetSubmissionOfStudentInExamNeedGradeMidTermMulti(teacherId, examId, studentId);
            }

            if (result == null)
            {
                return NotFound("No submission found for the specified student in the exam.");
            }

            return Ok(result);
        }

        //API to save grade for student by teacher id and exam id and student id and questionId
        [HttpPost("teacher/{teacherId}/exam/{examId}/student/{studentId}/grade")]
        public async Task<IActionResult> SaveGradeForStudent(Guid teacherId, int examId, Guid studentId, [FromBody] QuestionPracExamDTO questionPracExamDTO)
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