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


        // API xóa câu hỏi (chuyển IsActive thành false)
        [HttpPut("DeleteQuestion/{questionId}/{type}")]
        public async Task<IActionResult> DeleteQuestion(int questionId, int type)
        {
            try
            {
                if (type != 1 && type != 2)
                    return BadRequest("Type chỉ được phép là 1 (trắc nghiệm) hoặc 2 (tự luận).");

                var result = await _practiceQuestionService.DeleteQuestionByTypeAsync(questionId, type);

                if (result)
                    return Ok(new { success = true, message = "Xóa câu hỏi thành công." });
                else
                    return NotFound(new { success = false, message = "Không tìm thấy câu hỏi." });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { success = false, message = "Lỗi khi xóa câu hỏi: " + ex.Message });
            }
        }



        // API lấy tất cả danh mục kỳ thi (CategoryExam)
        [HttpGet("GetAllCategoryExam")]
        public async Task<IActionResult> GetAllCategoryExam()
        {
            try
            {
                var categoryExams = await _categoryExamService.GetAllCategoryExamsAsync();
                if (categoryExams == null)
                    return NotFound("Không tìm thấy danh mục kỳ thi.");
                return Ok(categoryExams);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Lỗi khi lấy danh mục kỳ thi: " + ex.Message);
            }
        }

        // API lấy danh sách môn học theo CategoryExamId
        [HttpGet("GetSubjectsByCategoryExam/{categoryExamId}")]
        public async Task<IActionResult> GetSubjectsByCategoryExam(int categoryExamId)
        {
            try
            {
                var subjects = await _practiceQuestionService.GetSubjectsByCategoryExamIdAsync(categoryExamId);
                if (subjects == null || !subjects.Any())
                    return NotFound("Không tìm thấy môn học nào cho danh mục kỳ thi này.");
                return Ok(subjects);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Lỗi khi lấy danh sách môn học: " + ex.Message);
            }
        }




        // API lấy danh sách câu hỏi trắc nghiệm và tự luận với phân trang và filter
        [HttpGet("all-questions")]
        public async Task<IActionResult> GetAllQuestions(
            int? majorId = null,
            int? subjectId = null,
            int? chapterId = null,
            bool? isPublic = null,
            int? levelId = null,
            string? questionType = null, // "multiple" hoặc "essay" hoặc null
            int pageNumber = 1,
            int pageSize = 10,
            Guid? teacherId=null)
        {
            try
            {
                var (data, totalCount) = await _practiceQuestionService.GetAllQuestionsAsync(
                    majorId, subjectId, chapterId, isPublic, levelId, questionType, pageNumber, pageSize,teacherId);

                int totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                return Ok(new
                {
                    TotalPages = totalPages,
                    Questions = data
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Đã xảy ra lỗi: {ex.Message}");
            }
        }



        // API lấy danh sách câu hỏi thực hành với phân trang
        [HttpGet("practice-questions")]
        public async Task<IActionResult> GetPracticeQuestions(
            [FromQuery] int classId,
            [FromQuery] string? content,
            [FromQuery] int? levelId,
            [FromQuery] int? chapterId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            if (classId <= 0)
                return BadRequest("classId là bắt buộc và phải > 0");

            try
            {
                var (data, total) = await _practiceQuestionService.GetPracticeQuestionsAsync(classId, content, levelId, chapterId, page, pageSize);

                int totalPages = (int)Math.Ceiling((double)total / pageSize);

                return Ok(new
                {
                    Total = total,
                    TotalPages = totalPages,
                    Page = page,
                    PageSize = pageSize,
                    Data = data
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Đã xảy ra lỗi: {ex.Message}");
            }
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
        [HttpPost("CreateMultiple/{chapterId}")]
        public async Task<IActionResult> CreateMultiple(int chapterId, [FromBody] List<PracticeQuestionCreateNoChapterDTO> dtos)
        {
            if (dtos == null || !dtos.Any())
                return BadRequest("Danh sách câu hỏi không được rỗng.");

            var result = await _practiceQuestionService.PracticeQuestionsCreateAsync(chapterId, dtos);
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



