using DocumentFormat.OpenXml.Bibliography;
using DocumentFormat.OpenXml.Wordprocessing;
using GESS.Model.MultipleExam;
using GESS.Model.PracticeExam;
using GESS.Model.PracticeExamPaper;
using GESS.Service.assignGradeCreateExam;
using GESS.Service.finalExamPaper;
using GESS.Service.finalPracExam;
using GESS.Service.multipleQuestion;
using Microsoft.AspNetCore.Mvc;
using static GESS.Model.PracticeExam.PracticeExamCreateDTO;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FinalExamPaperController : ControllerBase
    {
        private readonly IFinalExamService _finalExamService;
        private readonly IFinalExamPaperService _finalExamPaperService;
        public FinalExamPaperController(IFinalExamService finalExamService, IFinalExamPaperService finalExamPaperService)
        {
            _finalExamService = finalExamService;
            _finalExamPaperService = finalExamPaperService;

        }

        //API to get all major that teacher have role create exam 
        [HttpGet("GetAllMajorByTeacherId")]
        public IActionResult GetAllMajorByTeacherId(Guid teacherId)
        {
            try
            {
                var result = _finalExamService.GetAllMajorByTeacherId(teacherId);
                if (result == null || !result.Result.Any())
                {
                    return NotFound("No majors found for the given teacher ID.");
                }
                return Ok(result.Result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        //API to get all exam paper by subject id and semester id
        [HttpGet("GetAllFinalExamPaper")]
        public async Task<IActionResult> GetAllFinalExamPaper(int subjectId, int semesterId, int year)
        {
            try
            {
                var examPapers = await _finalExamService.GetAllFinalExamPaper(subjectId, semesterId, year);
                if (examPapers == null || !examPapers.Any())
                {
                    return NotFound("No exam papers found for the specified subject and semester.");
                }
                return Ok(examPapers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        //API to view detail of final exam paper by exam paper id
        [HttpGet("ViewFinalExamPaperDetail/{examPaperId}")]
        public async Task<IActionResult> ViewFinalExamPaperDetail(int examPaperId)
        {
            try
            {
                var examPaperDetail = await _finalExamService.ViewFinalExamPaperDetail(examPaperId);
                if (examPaperDetail == null)
                {
                    return NotFound("No exam paper detail found for the specified exam paper ID.");
                }
                return Ok(examPaperDetail);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        //API to create final exam paper
        [HttpPost("CreateFinalExamPaper")]
        public async Task<IActionResult> CreateFinalExamPaper([FromBody] FinalPracticeExamPaperCreateRequest finalExamPaperCreateDto)
        {
            if (finalExamPaperCreateDto == null)
            {
                return BadRequest("Invalid exam paper data.");
            }
            try
            {
                var createdExamPaper = await _finalExamPaperService.CreateFinalExamPaperAsync(finalExamPaperCreateDto);
                if (createdExamPaper == null)
                {
                    return BadRequest("Failed to create exam paper.");
                }
                return Ok(createdExamPaper);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        //API to get final practice question by semester id and chapter id and level id and text search need pagination
        [HttpGet("GetFinalPracticeQuestion")]
        public async Task<IActionResult> GetFinalPracticeQuestion(int? semesterId = null, int? chapterId = null, int? levelId = null, string? textSearch = null, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var questions = await _finalExamPaperService.GetFinalPracticeQuestion(semesterId, chapterId, levelId, textSearch, pageNumber, pageSize);
                if (questions == null || !questions.Any())
                {
                    return NotFound("No practice questions found for the specified criteria.");
                }
                return Ok(questions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        //API to count page number of final exam by subject id and semester id and year and type and text search
        [HttpGet("CountPageNumberFinalExam")]
        public async Task<IActionResult> CountPageNumberFinalExamQuestion(int? semesterId = null, int? chapterId = null, int? levelId = null, string? textSearch = null, int pageSize = 10)
        {
            try
            {
                var pageCount = await _finalExamPaperService.CountPageNumberFinalExamQuestion(semesterId, chapterId, levelId, textSearch, pageSize);
                return Ok(pageCount);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
