using GESS.Model.PracticeTestQuestions;
using GESS.Model.QuestionPracExam;
using GESS.Service.examSchedule;
using GESS.Service.examSlotService;
using GESS.Service.gradeSchedule;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

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
        public async Task<IActionResult> GetStudentsInExamNeedGrade(Guid teacherId, int classID, int ExamType, int examId)
        {
            var result = await _gradeScheduleService.GetStudentsInExamNeedGradeMidTermAsync(teacherId, classID, ExamType, examId);
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
        //API to change isGraded status of practiceExam
        [HttpPost("teacher/{teacherId}/exam/{examId}/changeIsGraded")]
        public async Task<IActionResult> ChangeIsGradedStatus(Guid teacherId, int examId, Guid studentId)
        {
            var submission = await _gradeScheduleService.ChangeStatusGraded(teacherId, examId);
            if (!submission)
            {
                return NotFound("No submission found for the specified exam or student, or the status could not be updated.");
            }

            return Ok("Submission status updated successfully.");
        }



        [HttpPost("examId/{examId}/student/{studentId}/mark-graded")]
        public async Task<IActionResult> MarkStudentExamGraded(int examId, Guid studentId)
        {
            // Đọc body và lấy totalScore
            string body;
            using (var reader = new StreamReader(Request.Body))
            {
                body = await reader.ReadToEndAsync();
            }
            if (string.IsNullOrWhiteSpace(body))
                return BadRequest("Thiếu thông tin tổng điểm.");

            var jObj = Newtonsoft.Json.Linq.JObject.Parse(body);
            if (jObj["totalScore"] == null)
                return BadRequest("Thiếu trường totalScore.");
            double totalScore = jObj["totalScore"].Value<double>();

            var success = await _gradeScheduleService.MarkStudentExamGradeMidTermdAsync(examId, studentId, totalScore);
            if (!success)
                return NotFound("Không tìm thấy bài thi hoặc cập nhật thất bại.");
            return Ok("Đã chuyển trạng thái chấm bài thành công và lưu điểm.");
        }


        [HttpPost("practice-exam/{pracExamId}/mark-graded")]
        public async Task<IActionResult> MarkPracticeExamGraded(int pracExamId)
        {
            var result = await _gradeScheduleService.MarkPracticeExamGradedAsync(pracExamId);
            if (!result)
                return NotFound("PracticeExam not found or update failed.");
            return Ok("PracticeExam marked as graded successfully.");
        }


    }
}