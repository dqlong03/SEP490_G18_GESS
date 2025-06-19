using GESS.Model.MultipleQuestionDTO;
using GESS.Model.PracticeQuestionDTO;
using GESS.Service.categoryExam;
using GESS.Service.chapter;
using GESS.Service.levelquestion;
using GESS.Service.multipleQuestion;
using GESS.Service.practicequestion;
using GESS.Service.semesters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MultipleQuestionController : ControllerBase
    {
        private readonly IMultipleQuestionService _multipleQuestionService;
        private readonly IChapterService _chapterService;
        private readonly ISemestersService _semesterService;
        private readonly ICategoryExamService _categoryExamService;
        private readonly ILevelQuestionService _levelQuestionService;
        public MultipleQuestionController(IMultipleQuestionService multipleQuestionService, IChapterService chapterService, ISemestersService semesterService, ICategoryExamService categoryExamService, ILevelQuestionService levelQuestionService)
        {
            _multipleQuestionService = multipleQuestionService;
            _chapterService = chapterService;
            _semesterService = semesterService;
            _categoryExamService = categoryExamService;
            _levelQuestionService = levelQuestionService;
        }
        //API lấy danh sách câu hỏi thực hành
        [HttpGet("GetAllMultipleQuestions")]
        public async Task<IActionResult> GetAllMultipleQuestions()
        {
            try
            {
                var result = await _multipleQuestionService.GetAllMultipleQuestionsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }
        //API tạo câu hỏi thực hành
        [HttpPost("CreateMultipleQuestion")]
        public async Task<IActionResult> CreateMultipleQuestion([FromBody] MultipleQuestionCreateDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Invalid data.");
            }
            try
            {
                var result = await _multipleQuestionService.MultipleQuestionCreateAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {

                return StatusCode(StatusCodes.Status500InternalServerError, "Lỗi tạo câu hỏi");
            }
        }
        // API lấy danh sách chương (dùng trong dropdown, v.v.)
        [HttpGet("GetListChapter/{subjectId}")]
        public async Task<IActionResult> GetListChapter(int subjectId)
        {
            try
            {
                var chapters = await _chapterService.GetChaptersBySubjectId(subjectId);
                return Ok(chapters);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Không tìm thấy chương");
            }
        }
        // API lấy ra kỳ hiện tại
        [HttpGet("GetCurrentSemester")]
        public async Task<IActionResult> GetCurrentSemester()
        {
            try
            {
                var semester = await _semesterService.GetCurrentSemestersAsync();
                if (semester == null)
                    return NotFound("Không tìm thấy kỳ học hiện tại.");

                return Ok(semester);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Lỗi khi lấy kỳ học hiện tại.");
            }
        }
        //API lấy ra list CtegoryExam by từ id môn học
        [HttpGet("GetListCategoryExam/{subjectId}")]
        public async Task<IActionResult> GetListCategoryExam(int subjectId)
        {
            try
            {
                var categoryExam = await _categoryExamService.GetCategoriesBySubjectId(subjectId);
                if (categoryExam == null)
                    return NotFound("Không tìm thấy ");
                return Ok(categoryExam);
            }
            catch (Exception)
            {

                return StatusCode(StatusCodes.Status500InternalServerError, "Lỗi khi ");
            }
        }
        //API lấy ra mức độ khó của câu hỏi thực hành
        [HttpGet("GetLevelQuestion")]
        public async Task<IActionResult> GetLevelQuestion()
        {
            try
            {
                var levelQuestions = await _levelQuestionService.GetAllLevelQuestionsAsync();
                return Ok(levelQuestions);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Lỗi khi lấy mức độ câu hỏi trắc nghiệm.");
            }


        }
    }
}
