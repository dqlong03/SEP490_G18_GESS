using GESS.Model.Examination;
using GESS.Service.examination;
using GESS.Service.teacher;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExaminationController : ControllerBase
    {
        private readonly IExaminationService _examinationService;
        public ExaminationController(IExaminationService examinationService)
        {
            _examinationService = examinationService;
        }


        // Example endpoint to get all examinations with pagination
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExaminationResponse>>> GetAllExaminations(bool? active, string? name = null, DateTime? fromDate = null, DateTime? toDate = null, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var examinations = await _examinationService.GetAllExaminationsAsync(active, name, fromDate, toDate, pageNumber, pageSize);
                return Ok(examinations);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("CountPage")]
        public async Task<ActionResult<int>> CountPage(bool? active, string? name = null, DateTime? fromDate = null, DateTime? toDate = null, int pageSize = 10)
        {
            try
            {
                var count = await _examinationService.CountPageAsync(active, name, fromDate, toDate, pageSize);
                return Ok(count);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Example endpoint to get an examination by ID
        [HttpGet("{examinationId}")]
        public async Task<ActionResult<ExaminationResponse>> GetExaminationById(Guid examinationId)
        {
            try
            {
                var examination = await _examinationService.GetExaminationByIdAsync(examinationId);
                if (examination == null)
                {
                    return NotFound($"Examination with ID {examinationId} not found.");
                }
                return Ok(examination);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // Example endpoint to add a new examination
        [HttpPost]
        public async Task<ActionResult<ExaminationResponse>> AddExamination([FromBody] ExaminationCreationRequest request)
        {
            if (request == null)
            {
                return BadRequest("Examination creation request cannot be null.");
            }

            try
            {
                var examination = await _examinationService.AddExaminationAsync(request);
                return CreatedAtAction(nameof(GetExaminationById), new { examinationId = examination.ExaminationId }, examination);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // Example endpoint to update an existing examination
        [HttpPut("{examinationId}")]
        public async Task<ActionResult<ExaminationResponse>> UpdateExamination(Guid examinationId, [FromBody] ExaminationUpdateRequest request)
        {
            if (request == null)
            {
                return BadRequest("Examination update request cannot be null.");
            }

            try
            {
                var updatedExamination = await _examinationService.UpdateExaminationAsync(examinationId, request);
                if (updatedExamination == null)
                {
                    return NotFound($"Examination with ID {examinationId} not found.");
                }
                return Ok(updatedExamination);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // Example endpoint to delete an examination
        [HttpDelete("{examinationId}")]
        public async Task<IActionResult> DeleteExamination(Guid examinationId)
        {
            try
            {
                await _examinationService.DeleteExaminationAsync(examinationId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // Example endpoint to search examinations by keyword
        [HttpGet("search")]
        public async Task<ActionResult<List<ExaminationResponse>>> SearchExaminations([FromQuery] string keyword)
        {
            try
            {
                var examinations = await _examinationService.SearchExaminationsAsync(keyword);
                return Ok(examinations);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // Example endpoint to import examinations from an Excel file
        [HttpPost("import")]
        public async Task<IActionResult> ImportExaminations(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("File cannot be null or empty.");
            }

            try
            {
                var examinations = await _examinationService.ImportExaminationsFromExcelAsync(file);
                return Ok(new { Count = examinations.Count, Examinations = examinations });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error processing file: {ex.Message}");
            }
        }
    }
}
