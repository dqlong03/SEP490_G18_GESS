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

      //  private readonly IUnitOfWork _unitOfWork;
        public PracticeExamPaperController(IPracticeExamPaperService practiceExamPaperService, ICategoryExamService categoryExamService, ISubjectService subjectService, ISemestersService semestersService, IUnitOfWork unitOfWork)
        {
            _practiceExamPaperService = practiceExamPaperService;
            _categoryExamService = categoryExamService;
            _subjectService = subjectService;
            _semesterService = semestersService;
           // _unitOfWork = unitOfWork;
        }



        //[HttpPost("create-exam-paper")]
        //public async Task<IActionResult> CreateExamPaper([FromBody] PracticeExamPaperCreateRequest request)
        //{
        //    // 1. Get latest SemesterId
        //    var latestSemester = _unitOfWork.DataContext.Set<Semester>().OrderByDescending(s => s.SemesterId).FirstOrDefault();
        //    if (latestSemester == null)
        //        return BadRequest("No semester found.");

        //    int semesterId = latestSemester.SemesterId;

        //    // 2. Get SubjectId from ClassId
        //    var classEntity = await _unitOfWork.ClassRepository.GetByIdAsync(request.ClassId);
        //    if (classEntity == null)
        //        return BadRequest("Class not found.");
        //    int subjectId = classEntity.SubjectId;

        //    // 3. Create manual PracticeQuestions and PracticeAnswers
        //    var createdPracticeQuestions = new List<PracticeQuestion>();
        //    foreach (var mq in request.ManualQuestions)
        //    {
        //        int levelId = mq.Level switch
        //        {
        //            "Dễ" => 1,
        //            "Trung bình" => 2,
        //            "Khó" => 3,
        //            _ => 2
        //        };

        //        var pq = new PracticeQuestion
        //        {
        //            Content = mq.Content,
        //            UrlImg = null,
        //            IsActive = true,
        //            ChapterId = mq.ChapterId,
        //            CategoryExamId = request.CategoryExamId,
        //            LevelQuestionId = levelId,
        //            SemesterId = semesterId,
        //            CreateAt = DateTime.UtcNow,
        //            CreatedBy = request.TeacherId, // Assuming TeacherId is the creator
        //            IsPublic = true // Assuming manual questions are  public
        //            // Add other required fields if any
        //        };
        //        await _unitOfWork.DataContext.PracticeQuestions.AddAsync(pq);
        //        createdPracticeQuestions.Add(pq);
        //    }
        //    await _unitOfWork.SaveChangesAsync();

        //    // 4. Create PracticeAnswers for manual questions
        //    foreach (var (pq, mq) in createdPracticeQuestions.Zip(request.ManualQuestions))
        //    {
        //        var answer = new PracticeAnswer
        //        {
        //            AnswerContent = mq.Criteria,
        //            PracticeQuestionId = pq.PracticeQuestionId
        //        };
        //        await _unitOfWork.DataContext.PracticeAnswers.AddAsync(answer);
        //    }
        //    await _unitOfWork.SaveChangesAsync();

        //    // 5. Create PracticeExamPaper
        //    var examPaper = new PracticeExamPaper
        //    {
        //        PracExamPaperName = request.ExamName,
        //        NumberQuestion = request.TotalQuestion,
        //        CreateAt = DateTime.UtcNow,
        //        TeacherId = request.TeacherId,
        //        CategoryExamId = request.CategoryExamId,
        //        SubjectId = subjectId,
        //        SemesterId = semesterId,
        //        Status = "published" // Add if you have this property
        //    };
        //    await _unitOfWork.DataContext.PracticeExamPapers.AddAsync(examPaper);
        //    await _unitOfWork.SaveChangesAsync();

        //    // 6. Add PracticeTestQuestions (manual + selected)
        //    var allQuestions = createdPracticeQuestions
        //        .Select((q, idx) => new { q.PracticeQuestionId, Score = request.ManualQuestions[idx].Score })
        //        .Concat(request.SelectedQuestions.Select(sq => new { sq.PracticeQuestionId, sq.Score }));

        //    foreach (var q in allQuestions)
        //    {
        //        var testQuestion = new PracticeTestQuestion
        //        {
        //            PracExamPaperId = examPaper.PracExamPaperId,
        //            PracticeQuestionId = q.PracticeQuestionId,
        //            Score = q.Score
        //        };
        //        await _unitOfWork.DataContext.PracticeTestQuestions.AddAsync(testQuestion);
        //    }
        //    await _unitOfWork.SaveChangesAsync();

        //    return Ok(new { examPaper.PracExamPaperId });
        //}





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
