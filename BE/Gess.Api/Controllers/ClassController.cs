using GESS.Model.Class;
using GESS.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClassController : ControllerBase
    {
        private readonly IClassService _classService;
        public ClassController(IClassService classService)
        {
            _classService = classService;
        }
        [HttpGet("GetAllClass")]
        public async Task<IActionResult> GetAllClassAsync(string? name = null, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var classes = await _classService.GetAllClassAsync(name, pageNumber, pageSize);
                return Ok(classes);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpPost("CreateClass")]
        public async Task<IActionResult> CreateClass([FromBody] ClassCreateDTO classCreateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var createdClass = await _classService.CreateClassAsync(classCreateDto);
                return Created("", createdClass);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Internal server error: {ex.Message}");
            }
        }
        //API xóa lớp học
        [HttpDelete("DeleteClass/{id}")]
        public async Task<IActionResult> DeleteClass(int id)
        {
            try
            {
                var classToDelete = await _classService.GetByIdAsync(id);
                if (classToDelete == null)
                {
                    return NotFound(new { message = "Lớp học không tồn tại." });
                }
                await _classService.DeleteAsync(id);
                return Ok("Xóa thành công lớp học");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Internal server error: {ex.Message}");
            }
        }
        //API sửa lớp học
        [HttpPut("UpdateClass/{id}")]
        public async Task<IActionResult> UpdateClass(int id, [FromBody] ClassUpdateDTO classUpdateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var updatedClass = await _classService.UpdateClassAsync(id, classUpdateDto);
                return Ok(updatedClass);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Internal server error: {ex.Message}");
            }
        }
    }
}
