using GESS.Model.Exam;
using GESS.Model.Student;
using GESS.Model.Subject;
using GESS.Service.examination;
using GESS.Service.student;
using Microsoft.AspNet.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
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
        public async Task<ActionResult<StudentResponse>> AddStudentAsync([FromForm] StudentCreationRequest request, IFormFile? avatar)
        {
            try
            {
                var student = await _studentService.AddStudentAsync(request, avatar);
                return CreatedAtAction(nameof(GetStudentById), new { studentId = student.StudentId }, student);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Example endpoint to update a student
        [HttpPut("{studentId}")]
        public async Task<ActionResult<StudentResponse>> UpdateStudentAsync(Guid studentId, [FromBody] StudentUpdateRequest request, IFormFile? avatar)
        {
            try
            {
                var student = await _studentService.UpdateStudentAsync(studentId, request, avatar);
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
        public async Task<IActionResult> ReadFileStudentsFromExcel(IFormFile file)
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


        [HttpGet("subjects/{studentId}")]
        public async Task<ActionResult<IEnumerable<AllSubjectBySemesterOfStudentDTOResponse>>> GetAllSubjectBySemesterOfStudent(Guid studentId, int? semesterId, int? year)
        {
            try
            {
                var subjects = await _studentService.GetAllSubjectBySemesterOfStudentAsync(semesterId, year, studentId);
                return Ok(subjects);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpGet("years/{studentId}")]
        public async Task<ActionResult<IEnumerable<int>>> GetAllYearOfStudent(Guid studentId)
        {
            try
            {
                var years = await _studentService.GetAllYearOfStudentAsync(studentId);
                return Ok(years);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("exams/{subjectId}/{studentId}")]
        public async Task<ActionResult<IEnumerable<HistoryExamOfStudentDTOResponse>>> GetHistoryExamOfStudentBySubId(int? semesterId, int? year, int subjectId, Guid studentId)
        {
            try
            {
                var exams = await _studentService.GetHistoryExamOfStudentBySubIdAsync(semesterId, year, subjectId, studentId);
                return Ok(exams);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Đã xảy ra lỗi không mong muốn.");
            }
        }
    }
}
