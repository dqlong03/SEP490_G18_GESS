using GESS.Model.Category;
using GESS.Service.categoryExam;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryExamController : ControllerBase
    {
        private readonly ICategoryExamService _categoryExamService;

        public CategoryExamController(ICategoryExamService categoryExamService)
        {
            _categoryExamService = categoryExamService;
        }

        // ✅ GET: api/CategoryExam/by-subject/{subjectId}
        [HttpGet("{subjectId}")]
        public async Task<ActionResult<IEnumerable<CategoryExamDTO>>> GetCategoryExamsBySubjectId(int subjectId)
        {
            try
            {
                var categoryExams = await _categoryExamService.GetCategoriesBySubjectId(subjectId);
                if (categoryExams == null || !categoryExams.Any())
                {
                    return NotFound("Không tìm thấy loại điểm nào cho subjectId này.");
                }
                return Ok(categoryExams);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("")]
        public async Task<ActionResult<IEnumerable<CategoryExamDTO>>> GetAllCategoryExams()
        {
            try
            {
                var categoryExams = await _categoryExamService.GetAllCategoryExamsAsync();
                return Ok(categoryExams);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
