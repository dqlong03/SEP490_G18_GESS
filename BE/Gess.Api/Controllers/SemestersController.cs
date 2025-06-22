using GESS.Entity.Entities;
using GESS.Model.SemestersDTO;
using GESS.Service.semesters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SemestersController : ControllerBase
    {
        private readonly ISemestersService _semesterService;
        public SemestersController(ISemestersService semesterService)
        {
            _semesterService = semesterService;
        }
        //API lấy ra danh sách kỳ hiện tại
        [HttpGet("CurrentSemester")]
        public async Task<ActionResult<IEnumerable<SemesterResponse>>> GetCurrentSemester()
        {
            try
            {
                var semesters = await _semesterService.GetCurrentSemestersAsync();
                return Ok(semesters);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }


        [HttpGet]
        public async Task<IActionResult> GetAllCurrentSemesters()
        {
            var result = await _semesterService.GetAllCurrentSemestersAsync();
            return Ok(result);
        }

        //[HttpPost]
        //public async Task<IActionResult> CreateSemester([FromBody] SemesterCreateDTO request)
        //{
        //     var duplicates = request.SemesterNames
        //    .Select(name => name.Trim().ToLower())
        //    .GroupBy(name => name)
        //    .Where(g => g.Count() > 1)
        //    .Select(g => g.Key)
        //    .ToList();

        //    if (duplicates.Any())
        //    {
        //        return BadRequest($"Các học kỳ bị trùng tên: {string.Join(", ", duplicates)}");
        //    }


        //    await _semesterService.CreateAsync(request);
        //    return Ok(new { message = "Tạo học kỳ thành công" });
        //}

        [HttpPut]
        public async Task<IActionResult> UpdateSemester([FromBody] SemesterUpdateDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            // Check trùng tên học kỳ trong danh sách trước khi xử lý
            var duplicates = request.Semesters
            .GroupBy(s => s.SemesterName.Trim().ToLower())
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();

            if (duplicates.Any())
            {
                return BadRequest($"Các học kỳ bị trùng tên: {string.Join(", ", duplicates)}");
            }

            await _semesterService.UpdateAsync(request);
            return Ok(new { message = "Cập nhật học kỳ thành công" });
        }

    }
}
