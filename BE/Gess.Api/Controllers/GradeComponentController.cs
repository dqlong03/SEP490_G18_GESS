using GESS.Common.HandleException;
using GESS.Model.GradeComponent;
using GESS.Service.GradeCompoService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

// ThaiNH_Create_UserProfile
namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GradeComponentController : ControllerBase
    {
        private readonly ICateExamSubService _service;

        public GradeComponentController(ICateExamSubService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpPost]
        public async Task<IActionResult> CreateCateExamSub([FromBody] CategoryExamSubjectDTO dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                );
                throw new ValidationException("Dữ liệu đầu vào không hợp lệ.", errors);
            }

            var result = await _service.CreateCateExamSubAsync(dto);
            return CreatedAtAction(nameof(GetAllCateExamSubBySubIdAsync), new { categoryExamId = result.CategoryExamId, subjectId = result.SubjectId }, result);
        }

        [HttpGet("{subjectId}")]
        public async Task<IActionResult> GetAllCateExamSubBySubIdAsync(int subjectId)
        {
            var result = await _service.GetAllCateExamSubBySubIdAsync(subjectId); 
            return Ok(result);
        }

   

        [HttpPut("{subjectId}/{categoryExamId}")]
        public async Task<IActionResult> UpdateCateExamSub(int subjectId , int categoryExamId, [FromBody] CategoryExamSubjectDTO dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                );
                throw new ValidationException("Dữ liệu đầu vào không hợp lệ.", errors);
            }

            await _service.UpdateCateExamSubAsync(subjectId, categoryExamId, dto);
            return NoContent();
        }

        [HttpDelete("{subjectId}/{categoryExamId}")]
        public async Task<IActionResult> DeleteCateExamSub(int subjectId , int categoryExamId)
        {
            await _service.DeleteCateExamSubAsync(subjectId , categoryExamId);
            return NoContent();
        }

        [HttpDelete("by-subject/{subjectId}")]
        public async Task<IActionResult> DeleteAllCESBySubjectId(int subjectId)
        {
            await _service.DeleteAllCESBySubjectIdAsync(subjectId);
            return NoContent();
        }
    }
}
