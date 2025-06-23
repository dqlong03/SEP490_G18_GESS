using GESS.Model.MultipleExam;
using GESS.Service.multianswer;
using GESS.Service.multipleExam;
using GESS.Service.multipleQuestion;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentExamController : ControllerBase
    {
        private readonly IMultipleExamService _multipleExamService;
        private readonly IMultipleQuestionService _multipleQuestionService;
        private readonly IMultiAnswerService _multipleAnswerService;

        public StudentExamController(IMultipleExamService multipleExamService, IMultipleQuestionService multipleQuestionService, IMultiAnswerService multiAnswerService)
        {
            _multipleExamService = multipleExamService;
            _multipleQuestionService = multipleQuestionService;
            _multipleAnswerService = multiAnswerService;
        }

        [HttpPost("CheckExamNameAndCodeME")]
        public async Task<IActionResult> CheckExamNameAndCodeME([FromBody] CheckExamRequestDTO request)
        {
            try
            {
                var result = await _multipleExamService.CheckExamNameAndCodeMEAsync(request);
                return Ok(new { success = true, message = result.Message, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
        [HttpGet("ByMultiExam/{multiExamId}")]
        public async Task<IActionResult> GetAllQuestionMultiExamByMultiExamId(int multiExamId)
        {
            var result = await _multipleQuestionService.GetAllQuestionMultiExamByMultiExamIdAsync(multiExamId);
            if (result == null || result.Count == 0)
                return NotFound(new { success = false, message = "Không tìm thấy câu hỏi cho bài thi này." });
            return Ok(new { success = true, data = result });
        }
        [HttpGet("GetAllMultiAnswerOfQuestion/{multiQuestionId}")]
        public async Task<IActionResult> GetAllMultiAnswerOfQuestion(int multiQuestionId)
        {
            var result = await _multipleAnswerService.GetAllMultiAnswerOfQuestionAsync(multiQuestionId);
            if (result == null || result.Count == 0)
                return NotFound(new { success = false, message = "Không tìm thấy đáp án cho câu hỏi này." });
            return Ok(new { success = true, data = result });
        }
        [HttpPost("update-progress")]
        public async Task<IActionResult> UpdateProgress([FromBody] UpdateMultiExamProgressDTO dto)
        {
            try
            {
                var result = await _multipleExamService.UpdateProgressAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("submit-exam")]
        public async Task<IActionResult> SubmitExam([FromBody] UpdateMultiExamProgressDTO dto)
        {
            try
            {
                var result = await _multipleExamService.SubmitExamAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}
