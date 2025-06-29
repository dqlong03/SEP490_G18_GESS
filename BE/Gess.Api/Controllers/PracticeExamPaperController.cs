using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Category;
using GESS.Model.PracticeExamPaper;
using GESS.Model.Subject;
using GESS.Service.categoryExam;
using GESS.Service.practiceExamPaper;
using GESS.Service.semesters;
using GESS.Service.subject;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PracticeExamPaperController : ControllerBase
    {

        private readonly IPracticeExamPaperService _practiceExamPaperService;
        private readonly ICategoryExamService _categoryExamService;
        private readonly ISubjectService _subjectService;
        private readonly ISemestersService _semesterService;

        public PracticeExamPaperController(IPracticeExamPaperService practiceExamPaperService, ICategoryExamService categoryExamService, ISubjectService subjectService, ISemestersService semestersService)
        {
            _practiceExamPaperService = practiceExamPaperService;
            _categoryExamService = categoryExamService;
            _subjectService = subjectService;
            _semesterService = semestersService;
        }


        //API tạo đề thi
        [HttpPost("create-exam-paper")]
        public async Task<IActionResult> CreateExamPaper([FromBody] PracticeExamPaperCreateRequest request)
        {
            var result = await _practiceExamPaperService.CreateExamPaperAsync(request);
            if (result == null)
                return BadRequest("Tạo đề thi thất bại.");
            return Ok(result);
        }



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
        public async Task<IActionResult> CountPages(string? name = null, int? subjectId = null, int? semesterId = null, int? categoryExamId = null, int pageSize = 5
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


        //API to get category by subjectId
        [HttpGet("category/{subjectId}")]
        public async Task<ActionResult<IEnumerable<CategoryExamDTO>>> GetCategoriesBySubjectId(int subjectId)
        {
            try
            {
                var categories = await _categoryExamService.GetCategoriesBySubjectId(subjectId);
                if (categories == null || !categories.Any())
                {
                    return NotFound("No categories found for the specified subject.");
                }
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        //API to get all Subject by MajorId
        [HttpGet("subject/{majorId}")]
        public async Task<ActionResult<IEnumerable<SubjectDTO>>> GetAllSubjectsByMajorId(int? majorId)
        {
            try
            {
                var subjects = await _subjectService.GetAllSubjectsByMajorId(majorId);
                if (subjects == null || !subjects.Any())
                {
                    return NotFound("No subjects found for the specified major.");
                }
                return Ok(subjects);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        //// API tạo đề thi
        //[HttpPost("create")]
        //public async Task<IActionResult> CreateExamPaper([FromBody] PracticeExamPaperCreateDTO dto)
        //{
        //    if (dto == null || dto.TotalQuestion <= 0)
        //        return BadRequest("Dữ liệu không hợp lệ.");

        //    var result = await _practiceExamPaperService.CreateExamPaperAsync(dto);
        //    if (result)
        //        return Ok("Tạo đề thi thành công.");
        //    return StatusCode(500, "Tạo đề thi thất bại.");
        //}

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
        // API tạo đề thi bởi giáo viên
        [HttpPost("CreateExampaperByTeacher/{teacherId}")]
        public async Task<IActionResult> CreateExampaperByTeacher([FromBody] PracticeExamPaperCreate practiceExamPaperCreate, Guid teacherId)
        {
            try
            {
                if (practiceExamPaperCreate == null)
                {
                    return BadRequest("Dữ liệu đầu vào không hợp lệ.");
                }

                var result = await _practiceExamPaperService.CreateExampaperByTeacherAsync(practiceExamPaperCreate, teacherId);
                return Ok(result);
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi khi tạo đề thi: {ex.Message}");
            }
        }
        //đây là khi chọn bank đề public
        [HttpGet("public")]
        public async Task<IActionResult> GetPublicPracticeQuestions([FromQuery] string? search, [FromQuery] int? levelQuestionId)
        {
            var result = await _practiceExamPaperService.GetPublicPracticeQuestionsAsync(search, levelQuestionId);
            if (result == null || !result.Any())
            {
                return NotFound("Không có kết quả phù hợp.");
            }
            return Ok(result);
        }


        //khi chọn bank đề trạng thái privte phải truyền vào id của teacher
        [HttpGet("private/{teacherId}")]
        public async Task<IActionResult> GetPrivatePracticeQuestions(Guid teacherId, [FromQuery] string? search, [FromQuery] int? levelQuestionId)
        {
            var result = await _practiceExamPaperService.GetPrivatePracticeQuestionsAsync(teacherId, search, levelQuestionId);
            if (result == null || !result.Any())
            {
                return NotFound("Không có kết quả phù hợp.");
            }
            return Ok(result);
        }
        //API chi tiết đề thi
        [HttpGet("DetailExamPaper/{examPaperId}")]
        public async Task<IActionResult> DetailExamPaper(int examPaperId)
        {
            try
            {
                var result = await _practiceExamPaperService.GetExamPaperDetailAsync(examPaperId);
                if (result == null)
                {
                    return NotFound("Không tìm thấy đề thi với ID đã cho.");
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi khi lấy chi tiết đề thi: {ex.Message}");
            }

        }
    }
}
