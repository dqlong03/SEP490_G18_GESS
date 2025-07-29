using DocumentFormat.OpenXml.Wordprocessing;
using GESS.Model.MultipleExam;
using GESS.Model.PracticeExam;
using GESS.Service.assignGradeCreateExam;
using GESS.Service.finalPracExam;
using GESS.Service.multipleQuestion;
using Microsoft.AspNetCore.Mvc;
using static GESS.Model.PracticeExam.PracticeExamCreateDTO;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FinalExamController : ControllerBase
    {
        private readonly IMultipleQuestionService _multipleQuestionService;
        private readonly IFinalExamService _finalExamService;
        public FinalExamController(IFinalExamService finalExamService, IMultipleQuestionService questionService)
        {
            _finalExamService = finalExamService;
            _multipleQuestionService = questionService;

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
        //API to get all chapter by subject id for multiple choice exam
        [HttpGet("GetAllChapterBySubjectId")]
        public IActionResult GetAllChapterBySubjectId(int subjectId)
        {
            try
            {
                var result = _finalExamService.GetAllChapterBySubjectId(subjectId);
                if (result == null || !result.Result.Any())
                {
                    return NotFound("No chapters found for the given subject ID.");
                }
                return Ok(result.Result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        //API to count final multiple question by chapter id and level id and semester id
        [HttpGet("GetFinalQuestionCount")]
        public async Task<int> GetFinalQuestionCount(int? chapterId = null, int? levelId = null, int? semesterId = 0)
        {
            try
            {
                var questionCounts = await _multipleQuestionService.GetFinalQuestionCount(chapterId, levelId, semesterId);
                return questionCounts;
            }
            catch (Exception ex)
            {
                return 0;
            }
        }
        //API to create a new final multiple exam
        [HttpPost("CreateFinalMultipleExam")]
        public async Task<ActionResult<FinalMultipleExamCreateDTO>> CreateFinalMultipleExam(FinalMultipleExamCreateDTO multipleExamCreateDto)
        {
            try
            {
                var createdExam = await _finalExamService.CreateFinalMultipleExamAsync(multipleExamCreateDto);
                return Ok(createdExam);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating final multiple exam: {ex.Message}");
            }
        }
        //API to get all exam paper by subject id and semester id
        [HttpGet("GetAllFinalExamPaper")]
        public async Task<IActionResult> GetAllFinalExamPaper(int subjectId, int semesterId)
        {
            try
            {
                var examPapers = await _finalExamService.GetAllFinalExamPaper(subjectId, semesterId);
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
        //API to create a new final Prac Exam
        [HttpPost("CreateFinalPracExam")]
        public async Task<IActionResult> CreateFinalPracExam(FinalPracticeExamCreateDTO finalPracExamCreateDto)
        {
            try
            {
                var createdExam = await _finalExamService.CreateFinalPracExamAsync(finalPracExamCreateDto);
                return Ok(createdExam);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating final practice exam: {ex.Message}");
            }
        }
        //API to get all final exam by subject id and semester id and year and type and text search need pagination
        [HttpGet("GetAllFinalExam")]
        public async Task<IActionResult> GetAllFinalExam(int subjectId, int? semesterId, int? year, int type, string? textSearch, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var exams = await _finalExamService.GetAllFinalExam(subjectId, semesterId, year, type, textSearch, pageNumber, pageSize);
                if (exams == null || !exams.Any())
                {
                    return NotFound("No final exams found for the specified criteria.");
                }
                return Ok(exams);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        //API to count page number of final exam by subject id and semester id and year and type and text search
        [HttpGet("CountPageNumberFinalExam")]
        public async Task<IActionResult> CountPageNumberFinalExam(int subjectId, int? semesterId, int? year, int type, string? textSearch, int pageSize = 10)
        {
            try
            {
                var pageCount = await _finalExamService.CountPageNumberFinalExam(subjectId, semesterId, year, type, textSearch, pageSize);
                return Ok(pageCount);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        //API to view final exam detail by exam id and type
        [HttpGet("ViewFinalExamDetail/{examId}/{type}")]
        public async Task<IActionResult> ViewFinalExamDetail(int examId, int type)
        {
            try
            {
                if (type == 1) // Multiple Choice Exam
                {
                    var examDetail = await _finalExamService.ViewMultiFinalExamDetail(examId);
                    if (examDetail == null)
                    {
                        return NotFound("No exam detail found for the specified exam ID.");
                    }
                    return Ok(examDetail);
                }
                else if (type == 2) // Practice Exam
                {
                    var examDetail = await _finalExamService.ViewPracFinalExamDetail(examId);
                    if (examDetail == null)
                    {
                        return NotFound("No exam detail found for the specified exam ID.");
                    }
                    return Ok(examDetail);
                }
                else
                {
                    return BadRequest("Invalid exam type specified.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
