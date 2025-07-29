using GESS.Entity.Entities;
using GESS.Model.Category;
using GESS.Model.Chapter;
using GESS.Model.Major;
using GESS.Model.MultipleExam;
using GESS.Model.PracticeExam;
using GESS.Model.PracticeExamPaper;
using GESS.Model.Subject;
using GESS.Model.TrainingProgram;
using GESS.Repository.Interface;
using GESS.Service.categoryExam;
using GESS.Service.chapter;
using GESS.Service.major;
using GESS.Service.multipleExam;
using GESS.Service.multipleQuestion;
using GESS.Service.practiceExam;
using GESS.Service.practiceExamPaper;
using GESS.Service.subject;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Drawing.Printing;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PracticeExamController : ControllerBase
    {
        private readonly IPracticeExamService _practiceExamService;
        private readonly IPracticeExamPaperService _practiceExamPaperService;
        private readonly IMajorService _majorService;
        private readonly ISubjectService _subjectService;
        private readonly ICategoryExamService _categoryExamService;
        private readonly IChapterService _chapterService;
        public PracticeExamController(IPracticeExamService practiceExamService, IPracticeExamPaperService practiceExamPaperService, ISubjectService subjectService, IMajorService majorService, ICategoryExamService categoryExamService, IChapterService chapterService)
        {
            _practiceExamService = practiceExamService;
            _practiceExamPaperService = practiceExamPaperService;
            _majorService = majorService;
            _subjectService = subjectService;
            _categoryExamService = categoryExamService;
            _chapterService = chapterService;
        }

        //API to get all Major
        [HttpGet("major")]
        public async Task<ActionResult<IEnumerable<MajorUpdateDTO>>> GetAllMajors()
        {
            try
            {
                var majors = await _majorService.GetAllAsync();
                return Ok(majors);
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

        //API to get all chapters by subjectId
        [HttpGet("chapter/{subjectId}")]
        public async Task<ActionResult<IEnumerable<ChapterDTO>>> GetChaptersBySubjectId(int subjectId)
        {
            try
            {
                var chapters = await _chapterService.GetChaptersBySubjectId(subjectId);
                if (chapters == null || !chapters.Any())
                {
                    return NotFound("No chapters found for the specified subject.");
                }
                return Ok(chapters);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        //API to get all practice exam paper by subjectId and categoryId and teacherId
        [HttpGet("exams_paper")]
        public async Task<ActionResult<IEnumerable<PracticeExamPaperDTO>>> GetAllPracticeExamPapers(int? subjectId, int? categoryId, Guid? teacherId, int? semesterId, string? year)
        {
            try
            {
                var exams = await _practiceExamPaperService.GetAllPracticeExamPapers(subjectId, categoryId, teacherId,semesterId, year);
                return Ok(exams);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        //API to create a new practice exam
        [HttpPost("create")]
        public async Task<ActionResult<PracticeExamCreateDTO>> CreatePracticeExam([FromBody] PracticeExamCreateDTO practiceExamCreateDto)
        {
            if (practiceExamCreateDto == null)
            {
                return BadRequest("Invalid practice exam data.");
            }
            try
            {
                var createdExam = await _practiceExamService.CreatePracticeExamAsync(practiceExamCreateDto);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpGet("GetPracticeExamForUpdate/{pracExamId}")]
        public async Task<IActionResult> GetPracticeExamForUpdate(int pracExamId)
        {
            var exam = await _practiceExamService.GetPracticeExamForUpdateAsync(pracExamId);
            if (exam == null)
                return NotFound("Practice exam not found");
            return Ok(exam);
        }

        //
        [HttpPut("update")]
        public async Task<IActionResult> UpdatePracticeExam([FromBody] PracticeExamUpdateDTO2 dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _practiceExamService.UpdatePracticeExamAsync(dto);
            if (!result)
                return NotFound("Practice exam not found or update failed.");

            return Ok("Update successful.");
        }



    }
} 