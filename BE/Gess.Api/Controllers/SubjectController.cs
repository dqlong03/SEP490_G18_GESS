using GESS.Entity.Entities;
using GESS.Model.Subject;
using GESS.Service.subject;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubjectController : ControllerBase
    {
        private readonly ISubjectService _subjectService;
        public SubjectController(ISubjectService subjectService)
        {
            _subjectService = subjectService;
        }
        //API to get all training programs with optional filters
        [HttpGet()]
        public async Task<IActionResult> GetAllSubjectsAsync(string? name = null, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var trainingPrograms = await _subjectService.GetAllSubjectsAsync(name, pageNumber, pageSize);
                return Ok(trainingPrograms);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        //API count page
        [HttpGet("CountPage")]
        public async Task<IActionResult> CountPageAsync(string? name = null, int pageSize = 10)
        {
            try
            {
                var count = await _subjectService.CountPageAsync(name, pageSize);
                return Ok(count);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        //API to create a new subject
        [HttpPost()]
        public async Task<IActionResult> CreateSubjectAsync([FromBody] SubjectCreateDTO subjectCreateDTO)
        {
            if (subjectCreateDTO == null)
            {
                return BadRequest(new { message = "Dữ liệu không hợp lệ." });
            }
            try
            {
                var createdSubject = await _subjectService.CreateSubjectAsync(subjectCreateDTO);
                return StatusCode(201, createdSubject);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        //API to add subject to training program
        [HttpPost("AddSubjectToTrainingProgram/{trainingProgramId}/{subjectId}")]
        public async Task<IActionResult> AddSubjectToTrainingProgramAsync(int trainingProgramId, int subjectId)
        {
            try
            {
                var result = await _subjectService.AddSubjectToTrainingProgramAsync(trainingProgramId, subjectId);
                if (result)
                {
                    return Ok(new { message = "Môn học đã được thêm vào chương trình đào tạo." });
                }
                return BadRequest(new { message = "Lỗi khi thêm môn học vào chương trình đào tạo." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        //API to remove subject from training program
        [HttpDelete("RemoveSubjectFromTrainingProgram/{trainingProgramId}/{subjectId}")]
        public async Task<IActionResult> RemoveSubjectFromTrainingProgramAsync(int trainingProgramId, int subjectId)
        {
            try
            {
                var result = await _subjectService.RemoveSubjectFromTrainingProgramAsync(trainingProgramId, subjectId);
                if (result)
                {
                    return Ok(new { message = "Môn học đã được xóa khỏi chương trình đào tạo." });
                }
                return BadRequest(new { message = "Lỗi khi xóa môn học khỏi chương trình đào tạo." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        //API to get subjects in a training program
        [HttpGet("TrainingProgram/{trainingProgramId}")]
        public async Task<IActionResult> GetSubjectsInTrainingProgramAsync(int trainingProgramId, string? name = null, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var subjects = await _subjectService.GetSubjectsInTrainingProgramAsync(trainingProgramId, name, pageNumber, pageSize);
                return Ok(subjects);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        //API to update a subject
        [HttpPut("{subjectId}")]
        public async Task<IActionResult> UpdateSubjectAsync(int subjectId, [FromBody] SubjectDTO subjectUpdateDTO)
        {
            if (subjectUpdateDTO == null)
            {
                return BadRequest(new { message = "Dữ liệu không hợp lệ." });
            }
            try
            {
                var updatedSubject = await _subjectService.UpdateSubjectAsync(subjectId, subjectUpdateDTO);
                return Ok(updatedSubject);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //API danh sách môn 
       
        [HttpGet("ListSubject")]
        public async Task<IActionResult> ListSubject()
        {
            var listSubject = await _subjectService.ListSubject(); 
            return Ok(listSubject);
        }

        // ThaiNH_add_UpdateMark&UserProfile_Begin
        [HttpGet("{subjectId}")]
        public async Task<ActionResult<SubjectDTO>> GetSubjectBySubId(int subjectId)
        {
            var subject = await _subjectService.GetSubjectBySubIdAsync(subjectId);
            if (subject == null)
                return NotFound("Không tìm thấy môn học");

            return Ok(subject);
        }
        // ThaiNH_add_UpdateMark&UserProfile_End

    }
}