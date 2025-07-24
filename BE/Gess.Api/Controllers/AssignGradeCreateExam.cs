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
        public IActionResult Get(Guid teacherId)
        {
            try
            {
                var result = _assignGradeCreateExamService.GetAllSubjectsByTeacherId(teacherId);
                if (result == null || !result.Result.Any())
                {
                    return NotFound("No subjects found for the given teacher ID.");
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        //API to get all teacher have subject by subject id
        [HttpGet("GetAllTeacherHaveSubject")]
        public IActionResult GetAllTeacherHaveSubject(int subjectId)
        {
            try
            {
                var result = _assignGradeCreateExamService.GetAllTeacherHaveSubject(subjectId);
                if (result == null || !result.Result.Any())
                {
                    return NotFound("No teachers found with subjects.");
                }
                return Ok(result);
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
        //API to assign role craete exam to teacher
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
