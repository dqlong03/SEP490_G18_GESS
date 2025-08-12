using GESS.Model.Class;
using GESS.Model.Student;
using GESS.Repository.Interface;
using GESS.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClassController : ControllerBase
    {
        private readonly IClassService _classService;
     
        public ClassController(IClassService classService)
        {
            _classService = classService;
        }


        //
        [HttpGet("exam-scores")]
        public async Task<IActionResult> GetStudentScoresByExam([FromQuery] int examId, [FromQuery] int examType)
        {
            var scores = await _classService.GetStudentScoresByExamAsync(examId, examType);
            if (scores == null || !scores.Any())
                return NotFound("No scores found for the given parameters.");
            return Ok(scores);
        }


        //API hiển thị danh sách lớp học theo id môn học
        [HttpGet("{classId}/subject-id")]
        public async Task<IActionResult> GetSubjectIdByClassId(int classId)
        {
            var subjectId = await _classService.GetSubjectIdByClassIdAsync(classId);
            if (subjectId == null)
                return NotFound("Class not found");
            return Ok(subjectId);
        }

        //API hiển thị danh sách học sinh theo id lớp học
        [HttpGet("{classId}/students")]
        public async Task<IActionResult> GetStudentsByClassId(int classId)
        {
            var students = await _classService.GetStudentsByClassIdAsync(classId);
            return Ok(students);
        }

        //API hiển thị danh sách thành phần điểm theo id lớp học
        [HttpGet("{classId}/grade-components")]
        public async Task<IActionResult> GetGradeComponentsByClassId(int classId)
        {
            var result = await _classService.GetGradeComponentsByClassIdAsync(classId);
            return Ok(result);
        }

        //API hiển thị danh sách chương theo id lớp học
        [HttpGet("{classId}/chapters")]
        public async Task<IActionResult> GetChaptersByClassId(int classId)
        {
            var chapters = await _classService.GetChaptersByClassIdAsync(classId);
            return Ok(chapters);
        }

        //API hiển thị chi tiết lớp học theo id: ds học sinh + các bài kiểm tra
        [HttpGet("{classId}/detail")]
        public async Task<IActionResult> GetClassDetail(int classId)
        {
            var result = await _classService.GetClassDetailAsync(classId);
            if (result == null)
                return NotFound("Class not found");
            return Ok(result);
        }


        //API hiển thị danh sách lớp học thực hiện search, lọc theo semester, subject
        [HttpGet("GetAllClass")]
        public async Task<IActionResult> GetAllClassAsync( string? name = null,int? subjectId = null,int? semesterId = null,int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var classes = await _classService.GetAllClassAsync(name, subjectId, semesterId, pageNumber, pageSize);
                return Ok(classes);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        //API Tạo lớp học và thêm sinh viên vào luôn
        [HttpPost("CreateClass")]
        public async Task<IActionResult> CreateClass([FromBody] ClassCreateDTO classCreateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var createdClass = await _classService.CreateClassAsync(classCreateDto);
                return Created("", createdClass);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Internal server error: {ex.Message}");
            }
        }
        //API xóa lớp học
        [HttpDelete("DeleteClass/{id}")]
        public async Task<IActionResult> DeleteClass(int id)
        {
            try
            {
                var classToDelete = await _classService.GetByIdAsync(id);
                if (classToDelete == null)
                {
                    return NotFound(new { message = "Lớp học không tồn tại." });
                }
                await _classService.DeleteAsync(id);
                return Ok("Xóa thành công lớp học");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Internal server error: {ex.Message}");
            }
        }
        //API sửa lớp học
        [HttpPut("UpdateClass/{id}")]
        public async Task<IActionResult> UpdateClass(int id, [FromBody] ClassUpdateDTO classUpdateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var updatedClass = await _classService.UpdateClassAsync(id, classUpdateDto);
                return Ok(updatedClass);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Internal server error: {ex.Message}");
            }
        }
        //API đếm số trang
        [HttpGet("CountPages")]
        public async Task<IActionResult> CountPages(string? name = null, int? subjectId = null, int? semesterId = null, int pageSize = 10)
        {
            try
            {
                var totalPages = await _classService.CountPageAsync(name, subjectId, semesterId, pageSize);
                return Ok(totalPages);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
        //API lớp của tôi
        [HttpGet("teacherId")]
        public async Task<IActionResult> GetAllClassByTeacherIdAsync(Guid teacherId, string? name = null, int? subjectId = null, int? semesterId = null, int pageNumber = 1, int pageSize = 5, int? year= null)
        {
            try
            {
                var classes = await _classService.GetAllClassByTeacherIdAsync(teacherId,name, subjectId, semesterId, pageNumber, pageSize,year);
                return Ok(classes);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        //API đếm số trang lớp của tôi
        [HttpGet("CountPagesByTeacher/{teacherId}")]
        public async Task<IActionResult> CountPagesByTeacher(Guid teacherId, string? name = null, int? subjectId = null, int? semesterId = null, int pageSize = 5,int? year= null)
        {
            try
            {
                var totalPages = await _classService.CountPageByTeacherAsync(teacherId,name, subjectId, semesterId, pageSize,year);
                return Ok(totalPages);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
        //API thêm student vào một lớp đã có
        [HttpPost("AddStudentsToClass")]
        public async Task<IActionResult> AddStudentsToClass([FromBody] AddStudentsToClassRequest request)
        {
            try
            {
                await _classService.AddStudentsToClassAsync(request);
                return Ok("Thêm sinh viên vào lớp thành công.");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        // Gess.Api/Controllers/ClassController.cs
        [HttpGet("subjects-by-teacher/{teacherId}")]
        public async Task<IActionResult> GetSubjectsByTeacherId(Guid teacherId)
        {
            var subjects = await _classService.GetSubjectsByTeacherIdAsync(teacherId);
            if (subjects == null || !subjects.Any())
                return NotFound("No subjects found for this teacher.");
            return Ok(subjects);
        }



    }
}
