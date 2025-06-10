using GESS.Model.Teacher;
using GESS.Service.teacher;
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
        public async Task<IActionResult> GetAllTeachers()
        {
            var teachers = await _teacherService.GetAllTeachersAsync();
            return Ok(teachers);
        }

        [HttpPost]
        public async Task<IActionResult> AddTeacher([FromBody] TeacherCreationRequest request)
        {
            var teacher = await _teacherService.AddTeacherAsync(request);
            return CreatedAtAction(nameof(GetTeacherById), new { teacherId = teacher.TeacherId }, teacher);
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
    }
}
