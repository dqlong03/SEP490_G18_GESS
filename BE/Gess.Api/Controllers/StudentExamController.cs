using GESS.Common;
using GESS.Model.MultipleExam;
using GESS.Model.PracticeExam;
using GESS.Service.multianswer;
using GESS.Service.multipleExam;
using GESS.Service.multipleQuestion;
using GESS.Service.practiceExam;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Gess.Api.CustomAttributes;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentExamController : ControllerBase
    {
        private readonly IMultipleExamService _multipleExamService;
        private readonly IMultipleQuestionService _multipleQuestionService;
        private readonly IMultiAnswerService _multipleAnswerService;
        private readonly IPracticeExamService _practiceExamService;

        public StudentExamController(IMultipleExamService multipleExamService, IMultipleQuestionService multipleQuestionService, IMultiAnswerService multiAnswerService, IPracticeExamService practiceExamService)
        {
            _multipleExamService = multipleExamService;
            _multipleQuestionService = multipleQuestionService;
            _multipleAnswerService = multiAnswerService;
            _practiceExamService = practiceExamService;
        }
      
        [HttpPost("CheckExamNameAndCodeME")]
        //[CustomRoleAuth(PredefinedRole.STUDENT_ROLE)]
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
        [HttpGet("GetAllQuestionMultiExam/{multiExamId}")]
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

        [HttpPost("CheckExamNameAndCodePE")]
        public async Task<IActionResult> CheckExamNameAndCodePE([FromBody] CheckPracticeExamRequestDTO request)
        {
            try
            {
                var result = await _practiceExamService.CheckExamNameAndCodePEAsync(request);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetQuestionAndAnswerByPracExamId/{pracExamId}")]
        public async Task<IActionResult> GetQuestionAndAnswerByPracExamId(int pracExamId)
        {
            var result = await _practiceExamService.GetQuestionAndAnswerByPracExamId(pracExamId);
            return Ok(result);
        }

        [HttpGet("GetPracticeAnswerOfQuestion/{pracExamId}")]
        public async Task<IActionResult> GetPracticeAnswerOfQuestion(int pracExamId)
        {
            var result = await _practiceExamService.GetPracticeAnswerOfQuestion(pracExamId);
            return Ok(result);
        }

        [HttpPost("UpdatePEEach5minutes")]
        public async Task<IActionResult> UpdatePEEach5minutes([FromBody] UpdatePracticeExamAnswersRequest request)
        {
            await _practiceExamService.UpdatePEEach5minutesAsync(request.Answers);
            return Ok(new { success = true, message = "Lưu tạm thành công!" });
        }
        [HttpPost("SubmitPracticeExam")]
        public async Task<IActionResult> SubmitPracticeExam([FromBody] SubmitPracticeExamRequest dto)
        {
            try
            {
                var result = await _practiceExamService.SubmitPracticeExamAsync(dto);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }

        }
    }
}
