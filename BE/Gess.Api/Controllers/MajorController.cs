using GESS.Entity.Entities;
using GESS.Model.Major;
using GESS.Service.major;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MajorController : ControllerBase
    {
        private readonly IMajorService _majorService;
        public MajorController(IMajorService majorService)
        {
            _majorService = majorService;
        }
        [HttpGet("")]
        public async Task<ActionResult<IEnumerable<MajorUpdateDTO>>> GetAllMajors(int? active, string? name = null, DateTime? fromDate = null, DateTime? toDate = null, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var subjects = await _majorService.GetAllMajorsAsync(active, name, fromDate, toDate, pageNumber, pageSize);
                return Ok(subjects);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
        //API để đếm số trang
        [HttpGet("CountPage")]
        public async Task<ActionResult<int>> CountPage(int? active, string? name = null, DateTime? fromDate = null, DateTime? toDate = null, int pageSize = 10)
        {
            try
            {
                var count = await _majorService.CountPageAsync(active, name, fromDate, toDate, pageSize);
                return Ok(count);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        //API để tạo mới ngành
        [HttpPost("CreateMajor")]
        public async Task<ActionResult<MajorCreateDTO>> CreateMajor([FromBody] MajorCreateDTO majorCreateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var createdMajor = await _majorService.CreateMajorAsync(majorCreateDto);
                return CreatedAtAction(nameof(GetAllMajors), new { majorname = createdMajor.MajorName }, createdMajor);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        //API để cập nhật ngành
        [HttpPut("{id}")]
        public async Task<ActionResult<MajorUpdateDTO>> UpdateMajor(int id, [FromBody] MajorUpdateDTO majorUpdateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var updatedMajor = await _majorService.UpdateMajorAsync(id, majorUpdateDto);
                return Ok(updatedMajor);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        //API để lấy thông tin ngành theo ID
        [HttpGet("{majorId}")]
        public async Task<ActionResult<MajorUpdateDTO>> GetMajorById(int majorId)
        {
            try
            {
                var major = await _majorService.GetMajorById(majorId);
                if (major == null)
                {
                    return NotFound("Không tìm thấy ngành với ID này.");
                }
                return Ok(major);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        //API để xóa ngành theo ID
        [HttpDelete("{majorId}")]
        public async Task<ActionResult<MajorUpdateDTO>> DeleteMajorById(int majorId)
        {
            try
            {
                var deletedMajor = await _majorService.DeleteMajorById(majorId);
                return Ok(deletedMajor);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        //API để lấy tất cả ngành
        [HttpGet("GetAllMajors")]
        public async Task<ActionResult<IEnumerable<MajorListDTO>>> GetAllMajors()
        {
            try
            {
                var majors = await _majorService.GetAllMajor();
                return Ok(majors);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }

        }
    } 
}