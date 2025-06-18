using GESS.Model.PracticeQuestionDTO;
using GESS.Service.categoryExam;
using GESS.Service.chapter;
using GESS.Service.levelquestion;
using GESS.Service.practicequestion;
using GESS.Service.semesters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PracticeQuestionController : ControllerBase
    {
        private readonly IPracticeQuestionService _practiceQuestionService;
        private readonly IChapterService _chapterService;
        private readonly ISemestersService _semesterService;
        private readonly ICategoryExamService _categoryExamService;
        private readonly ILevelQuestionService _levelQuestionService;
        public PracticeQuestionController(IPracticeQuestionService practiceQuestionService, IChapterService chapterService, ISemestersService semesterService, ICategoryExamService categoryExamService, ILevelQuestionService levelQuestionService)
        {
            _practiceQuestionService = practiceQuestionService;
            _chapterService = chapterService;
            _semesterService = semesterService;
            _categoryExamService = categoryExamService;
            _levelQuestionService = levelQuestionService;
        }
        //API lấy danh sách câu hỏi thực hành
        [HttpGet("GetAllPracticeQuestions/{chapterId}")]
        public async Task<IActionResult> GetAllPracticeQuestions(int chapterId)
        {
            try
            {
                var result = await _practiceQuestionService.GetAllPracticeQuestionsAsync(chapterId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }
        //API tạo câu hỏi thực hành
        [HttpPost("CreatePracticeQuestion/{chapterId}")]
        public async Task<IActionResult> CreatePracticeQuestion(int chapterId, [FromBody] PracticeQuestionCreateDTO dto)
        {
            var result = await _practiceQuestionService.PracticeQuestionCreateAsync(chapterId, dto);
            return Ok(result);
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
                return StatusCode(StatusCodes.Status500InternalServerError, "Lỗi khi lấy mức độ câu hỏi thực hành.");
            }


        }
        //AP đọc file excel
        [HttpPost("ReadExcel")]
        public async Task<IActionResult> ReadExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("File không hợp lệ.");
            }
            try
            {
                var result = await _practiceQuestionService.PracticeQuestionReadExcel(file);
                if (result == null)
                {
                    return BadRequest("Không thể đọc file Excel.");
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Lỗi khi đọc file Excel: " + ex.Message);
            }
        }
    } 
}



