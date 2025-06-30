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
        [HttpGet("teacher/{teacherId}")]
        public async Task<IActionResult> GetExamNeedGradeByTeacherId(Guid teacherId, int subjectId, int statusExam, int semesterId, int year, int pagesze, int pageindex)
        {
            var result = await _gradeScheduleService.GetExamNeedGradeByTeacherIdAsync(teacherId, subjectId, statusExam, semesterId, year, pagesze, pageindex);
            if (result == null || !result.Any())
            {
                return NotFound("No exams found for grading.");
            }
            return Ok(result);
        }
        //API to count number of pages for exam need grade by teacher id
        [HttpGet("teacher/{teacherId}/count")]
        public async Task<int> CountExamNeedGradeByTeacherId(Guid teacherId, int subjectId, int statusExam, int semesterId, int year, int pagesze)
        {
            return await _gradeScheduleService.CountExamNeedGradeByTeacherIdAsync(teacherId, subjectId, statusExam, semesterId, year, pagesze);

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
    }
}