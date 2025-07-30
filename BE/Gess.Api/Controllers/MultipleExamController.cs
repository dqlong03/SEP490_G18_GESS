using GESS.Entity.Entities;
using GESS.Model.Category;
using GESS.Model.Chapter;
using GESS.Model.Major;
using GESS.Model.MultipleExam;
using GESS.Model.Subject;
using GESS.Model.TrainingProgram;
using GESS.Repository.Interface;
using GESS.Service.categoryExam;
using GESS.Service.chapter;
using GESS.Service.major;
using GESS.Service.multipleExam;
using GESS.Service.multipleQuestion;
using GESS.Service.subject;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Drawing.Printing;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MultipleExamController : ControllerBase
    {
        private readonly IMultipleExamService _multipleExamService;
        private readonly IMajorService _majorService;
        private readonly ISubjectService _subjectService;
        private readonly ICategoryExamService _categoryExamService;
        private readonly IChapterService _chapterService;
        private readonly IMultipleQuestionService _multipleQuestionService;
        public MultipleExamController(IMultipleExamService multipleExamService, ISubjectService subjectService, IMajorService majorService, ICategoryExamService categoryExamService, IChapterService chapterService, IMultipleQuestionService questionService)
        {
            _multipleExamService = multipleExamService;
            _majorService = majorService;
            _subjectService = subjectService;
            _categoryExamService = categoryExamService;
            _chapterService = chapterService;
            _multipleQuestionService = questionService;
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

        //API to get number of question in each chapter and category and level and [IsPublic] and [CreatedBy]
        [HttpGet("question-count")]
        public async Task<int> GetQuestionCount(int? chapterId = null,int? categoryId = null,int? levelId = null,bool? isPublic = null,Guid? createdBy = null)
        {
            try
            {
                var questionCounts = await _multipleQuestionService.GetQuestionCount(chapterId, categoryId, levelId, isPublic, createdBy);
                return questionCounts;
            }
            catch (Exception ex)
            {
                return 0;
            }
        }
        //API to create a new multiple exam
        [HttpPost("create")]
        public async Task<ActionResult<MultipleExamCreateDTO>> CreateMultipleExam(MultipleExamCreateDTO multipleExamCreateDto)
        {
            try
            {
                var createdExam = await _multipleExamService.CreateMultipleExamAsync(multipleExamCreateDto);
                return multipleExamCreateDto;
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("subjects-by-teacher/{teacherId}")]
        public async Task<IActionResult> GetSubjectsByTeacher(Guid teacherId)
        {
            var subjects = await _multipleExamService.GetSubjectsByTeacherIdAsync(teacherId);
            return Ok(subjects);
        }

        //
        [HttpGet("get-for-update/{multiExamId}")]
        public async Task<IActionResult> GetMultipleExamForUpdate(int multiExamId)
        {
            var exam = await _multipleExamService.GetMultipleExamForUpdateAsync(multiExamId);
            if (exam == null)
                return NotFound("Multiple exam not found");
            return Ok(exam);
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateMultipleExam([FromBody] MultipleExamUpdateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _multipleExamService.UpdateMultipleExamAsync(dto);
            if (!result)
                return NotFound("Multiple exam not found or update failed.");

            return Ok("Update successful.");
        }


    }
} 