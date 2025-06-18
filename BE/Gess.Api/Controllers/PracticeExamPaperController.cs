using GESS.Service.practiceExamPaper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PracticeExamPaperController : ControllerBase
    {

        private readonly IPracticeExamPaperService _practiceExamPaperService;

        public PracticeExamPaperController(IPracticeExamPaperService practiceExamPaperService)
        {
            _practiceExamPaperService = practiceExamPaperService;
        }
        //API cập nhật bài thi nếu nó ở trạng thái chưa bắt đầu
        //Api lấy danh sách đề thi
        [HttpGet("GetAllExamPaperListAsync")]
        public async Task<IActionResult> GetAllExamPaperListAsync(
            string? searchName = null,
            int? subjectId = null,
            int? semesterId = null,
            int? categoryExamId = null,
            int page = 1,
            int pageSize = 10
        )
        {
            try
            {
                var result = await _practiceExamPaperService.GetAllExamPaperListAsync(searchName, subjectId, semesterId, categoryExamId, page, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $" {ex.Message}");
            }
        }
        //API tổng số trang
        [HttpGet("CountPages")]

        public async Task<IActionResult> CountPages(string? name = null,int? subjectId = null,int? semesterId = null,int? categoryExamId = null, int pageSize = 5
)
        {
            try
            {
                if (pageSize < 1) pageSize = 5;

                var totalPages = await _practiceExamPaperService.CountPageAsync(name, subjectId, semesterId, categoryExamId, pageSize);
                return Ok(
               
                  
                 totalPages
                );
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Success = false,
                    Error = $"Internal server error: {ex.Message}"
                });
            }
        }
    }
}
