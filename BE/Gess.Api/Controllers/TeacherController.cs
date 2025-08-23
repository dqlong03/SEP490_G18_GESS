    using GESS.Model.Teacher;
using GESS.Service.teacher;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeacherController : ControllerBase
    {
        private readonly ITeacherService _teacherService;
        public TeacherController(ITeacherService teacherService)
        {
            _teacherService = teacherService;
        }

        [HttpGet("{teacherId}")]
        public async Task<IActionResult> GetTeacherById(Guid teacherId)
        {
            var teacher = await _teacherService.GetTeacherByIdAsync(teacherId);
            if (teacher == null) return NotFound();
            return Ok(teacher);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTeachers([FromQuery] bool? active, [FromQuery] string? name, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var teachers = await _teacherService.GetAllTeachersAsync(active, name, fromDate, toDate, pageNumber, pageSize);
            return Ok(teachers);
        }


        [HttpPost]
        public async Task<IActionResult> AddTeacher([FromBody] TeacherCreationRequest request)
        {
            var teacher = await _teacherService.AddTeacherAsync(request);
            return CreatedAtAction(nameof(GetTeacherById), new { teacherId = teacher.TeacherId }, teacher);
        }
        [HttpPost("Restore")]
        public async Task<IActionResult> RestoreTeacher([FromBody] Guid teacherId)
        {
            var message = await _teacherService.RestoreTeacher(teacherId);
            return Ok(new { Message = message });
        }
        [HttpPut("{teacherId}")]
        public async Task<IActionResult> UpdateTeacher(Guid teacherId, [FromBody] TeacherUpdateRequest request)
        {
            var teacher = await _teacherService.UpdateTeacherAsync(teacherId, request);
            return Ok(teacher);
        }

        [HttpDelete("{teacherId}")]
        public async Task<IActionResult> DeleteTeacher(Guid teacherId)
        {
            await _teacherService.DeleteTeacherAsync(teacherId);
            return NoContent();
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchTeachers([FromQuery] string keyword)
        {
            var teachers = await _teacherService.SearchTeachersAsync(keyword);
            return Ok(teachers);
        }

        //API add teacher list 
        [HttpPost("AddList")]
        public async Task<IActionResult> AddTeacherList(List<TeacherCreationRequest> list)
        {
            if (list == null || !list.Any())
            {
                return BadRequest("List of teachers cannot be empty.");
            }
            try
            {
                var teachers = await _teacherService.AddTeacherListAsync(list);
                return Ok(teachers);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error processing file: {ex.Message}");
            }
        }

    }
}
