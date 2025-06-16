using GESS.Model.Student;
using GESS.Service.examination;
using GESS.Service.Student;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly IStudentService _studentService;
        public StudentController(IStudentService studentService)
        {
            _studentService = studentService;
        }

        //Example endpoint to get all student with pagination
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StudentResponse>>> GetAllStudents(bool? active, string? name = null, DateTime? fromDate = null, DateTime? toDate = null, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var students = await _studentService.GetAllStudentsAsync(active, name, fromDate, toDate, pageNumber, pageSize);
                return Ok(students);
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
                var count = await _studentService.CountPageAsync(active, name, fromDate, toDate, pageSize);
                return Ok(count);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        // Example endpoint to get a student by ID
        [HttpGet("{studentId}")]
        public async Task<ActionResult<StudentResponse>> GetStudentById(Guid studentId)
        {
            try
            {
                var student = await _studentService.GetStudentByIdAsync(studentId);
                if (student == null)
                {
                    return NotFound($"Student with ID {studentId} not found.");
                }
                return Ok(student);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
        // Example endpoint to search students by keyword
        [HttpGet("Search")]
        public async Task<ActionResult<IEnumerable<StudentResponse>>> SearchStudents(string keyword)
        {
            try
            {
                var students = await _studentService.SearchStudentsAsync(keyword);
                return Ok(students);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
        // Example endpoint to add a new student
        [HttpPost]
        public async Task<ActionResult<StudentResponse>> AddStudentAsync([FromBody] StudentCreationRequest request)
        {
            try
            {
                var student = await _studentService.AddStudentAsync(request);
                return CreatedAtAction(nameof(GetStudentById), new { studentId = student.StudentId }, student);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Example endpoint to update a student
        [HttpPut("{studentId}")]
        public async Task<ActionResult<StudentResponse>> UpdateStudentAsync(Guid studentId, [FromBody] StudentUpdateRequest request)
        {
            try
            {
                var student = await _studentService.UpdateStudentAsync(studentId, request);
                if (student == null)
                {
                    return NotFound($"Student with ID {studentId} not found.");
                }
                return Ok(student);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        //Example import students from excel
        [HttpPost("Import")]
        public async Task<ActionResult<List<StudentResponse>>> ImportStudentsFromExcel(IFormFile file)
        {
            try
            {
                var students = await _studentService.ImportStudentsFromExcelAsync(file);
                return Ok(students);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        //API đọc danh sách sinh viên từ file Excel
        [HttpPost("ImportReadStudentsFromExcel")]
        public async Task<IActionResult> ImportStudentsFromExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("File không hợp lệ.");
            }
            try
            {
                var result = await _studentService.StudentFileExcelsAsync(file);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi khi xử lý file: {ex.Message}");
            }
        }

    }
}
