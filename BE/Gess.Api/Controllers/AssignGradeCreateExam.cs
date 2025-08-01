using DocumentFormat.OpenXml.Wordprocessing;
using GESS.Service.assignGradeCreateExam;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssignGradeCreateExamController : ControllerBase
    {
        private readonly IAssignGradeCreateExamService _assignGradeCreateExamService;
        public AssignGradeCreateExamController(IAssignGradeCreateExamService assignGradeCreateExamService)
        {
            _assignGradeCreateExamService = assignGradeCreateExamService;
        }
        //API to get all subjects in major by head of department id (teacher id)
        [HttpGet("GetAllSubjectsByTeacherId")]
        public IActionResult Get(Guid teacherId, string? textSearch = null)
        {
            try
            {
                var result = _assignGradeCreateExamService.GetAllSubjectsByTeacherId(teacherId,textSearch);
                if (result == null || !result.Result.Any())
                {
                    return NotFound("No subjects found for the given teacher ID.");
                }
                return Ok(result.Result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        //APPI to get all teacher in major id by teacher hod id
        [HttpGet("GetAllTeacherInMajor")]
        public IActionResult GetAllTeacherInMajor(Guid teacherId)
        {
            try
            {
                var result = _assignGradeCreateExamService.GetAllTeacherInMajor(teacherId);
                if (result == null || !result.Result.Any())
                {
                    return NotFound("No teachers found in the specified major.");
                }
                return Ok(result.Result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        //API to get all teacher have subject by subject id, need pagination and have text search
        [HttpGet("GetAllTeacherHaveSubject")]
        public IActionResult GetAllTeacherHaveSubject(int subjectId, string? textSearch = null, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var result = _assignGradeCreateExamService.GetAllTeacherHaveSubject(subjectId, textSearch, pageNumber, pageSize);
                if (result == null || !result.Result.Any())
                {
                    return NotFound("No teachers found for the specified subject.");
                }
                // Implement pagination and text search logic here if needed
                return Ok(result.Result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        //API to count page number of teacher have subject
        [HttpGet("CountPageNumberTeacherHaveSubject")]
        public IActionResult CountPageNumberTeacherHaveSubject(int subjectId, string? textSearch = null, int pageSize = 10)
        {
            try
            {
                var result = _assignGradeCreateExamService.CountPageNumberTeacherHaveSubject(subjectId, textSearch, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        //API to add teacher to subject
        [HttpPost("AddTeacherToSubject")]
        public IActionResult AddTeacherToSubject(Guid teacherId, int subjectId)
        {
            try
            {
                var result = _assignGradeCreateExamService.AddTeacherToSubject(teacherId, subjectId);
                if (result)
                {
                    return Ok("Teacher added to subject successfully.");
                }
                return BadRequest("Failed to add teacher to subject.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        //API to delete teacher from subject
        [HttpDelete("DeleteTeacherFromSubject")]
        public IActionResult DeleteTeacherFromSubject(Guid teacherId, int subjectId)
        {
            try
            {
                var result = _assignGradeCreateExamService.DeleteTeacherFromSubject(teacherId, subjectId);
                if (result)
                {
                    return Ok("Teacher removed from subject successfully.");
                }
                return BadRequest("Failed to remove teacher from subject.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        //API to assign role grade exam to teacher
        [HttpPost("AssignRoleGradeExam")]
        public IActionResult AssignRoleGradeExam(Guid teacherId, int subjectId)
        {
            try
            {
                var result = _assignGradeCreateExamService.AssignRoleGradeExam(teacherId, subjectId);
                return Ok("Role assigned successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        //API to assign role create exam to teacher
        [HttpPost("AssignRoleCreateExam")]
        public IActionResult AssignRoleCreateExam(Guid teacherId, int subjectId)
        {
            try
            {
                var result = _assignGradeCreateExamService.AssignRoleCreateExam(teacherId, subjectId);
                return Ok("Role assigned successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
