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
    }
}
