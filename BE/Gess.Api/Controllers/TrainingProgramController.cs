using GESS.Entity.Entities;
using GESS.Model.Chapter;
using GESS.Model.TrainingProgram;
using GESS.Service.trainingProgram;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Drawing.Printing;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrainingProgramController : ControllerBase
    {
        private readonly ITrainingProgramService _trainingProgramService;
        public TrainingProgramController(ITrainingProgramService trainingProgramService)
        {
            _trainingProgramService = trainingProgramService;
        }
        //API to get all training programs with optional filters
        [HttpGet("{majorId}")]
        public async Task<IActionResult> GetAllTrainingsAsync(int majorId, string? name = null, DateTime? fromDate = null, DateTime? toDate = null, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var trainingPrograms = await _trainingProgramService.GetAllTrainingsAsync(majorId, name, fromDate, toDate, pageNumber, pageSize);
                return Ok(trainingPrograms);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        //API to count total training programs
        [HttpGet("count/{majorId}")]
        public async Task<IActionResult> CountTrainingsAsync(int majorId, string? name = null, DateTime? fromDate = null, DateTime? toDate = null,int pageSize = 10)
        {
            try
            {
                var count = await _trainingProgramService.CountPageAsync(majorId,name, fromDate, toDate, pageSize);
                return Ok(count);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        //API to create a new training program
        [HttpPost("{majorId}")]
        public async Task<IActionResult> CreateTrainingProgramAsync(int majorId, [FromBody] TrainingProgramCreateDTO trainingProgramCreateDTO)
        {
            if (trainingProgramCreateDTO == null)
            {
                return BadRequest(new { message = "Dữ liệu không hợp lệ." });
            }
            try
            {
                var createdTrainingProgram = await _trainingProgramService.CreateTrainingProgramAsync(majorId, trainingProgramCreateDTO);
                return StatusCode(201, createdTrainingProgram);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        //API to delete a training program
        [HttpDelete("{trainingProgramId}")]
        public async Task<IActionResult> DeleteTrainingProgramAsync(int trainingProgramId)
        {
            try
            {
                var result = await _trainingProgramService.DeleteTrainingProgramAsync(trainingProgramId);
                if (result)
                {
                    return NoContent();
                }
                return NotFound(new { message = "Chương trình đào tạo không tồn tại." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        //API to update a training program
        [HttpPut("{trainingProgramId}")]
        public async Task<IActionResult> UpdateTrainingProgramAsync(int trainingProgramId, [FromBody] TrainingProgramDTO trainingProgramUpdateDTO)
        {
            if (trainingProgramUpdateDTO == null)
            {
                return BadRequest(new { message = "Dữ liệu không hợp lệ." });
            }
            try
            {
                var updatedTrainingProgram = await _trainingProgramService.UpdateTrainingProgramAsync(trainingProgramId, trainingProgramUpdateDTO);
                return Ok(updatedTrainingProgram);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
} 