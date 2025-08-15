using GESS.Model.Exam;
using GESS.Model.Student;
using GESS.Service.exam;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExamController : ControllerBase
    {
        //Api get all exam
        private readonly IExamService _examService;
        public ExamController(IExamService examService)
        {
            _examService = examService;
        }

        [HttpGet("teacher-exams/{teacherId}")]
        public async Task<IActionResult> GetTeacherExams(
            Guid teacherId,
            int pageNumber = 1,
            int pageSize = 10,
            int? majorId = null,
            int? semesterId = null,
            int? subjectId = null,
            string? examType = null,
            string? searchName = null)
        {
            var (data, totalCount) = await _examService.GetTeacherExamsAsync(
                teacherId, pageNumber, pageSize, majorId, semesterId, subjectId, examType, searchName);

            return Ok(new
            {
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                Data = data
            });
        }

        [HttpPut("practice")]
        public async Task<IActionResult> UpdatePracticeExam([FromBody] PracticeExamUpdateDTO dto)
        {
            var result = await _examService.UpdatePracticeExamAsync(dto);
            if (!result)
                return BadRequest("PracticeExam cannot be updated (not found or already started).");
            return Ok("PracticeExam updated successfully.");
        }

        [HttpPut("multi")]
        public async Task<IActionResult> UpdateMultiExam([FromBody] MultiExamUpdateDTO dto)
        {
            var result = await _examService.UpdateMultiExamAsync(dto);
            if (!result)
                return BadRequest("MultiExam cannot be updated (not found or already started).");
            return Ok("MultiExam updated successfully.");
        }

        //api trả về danh sách các bài thi của sinh viên
        //API: GetAllMultiExamOfStudent(): trả về 1 danh sách bài thi của sinh viên hiện trong trạng thái bài thi đó là chưa thi hoặc đang thi(còn nếu giảng viên đóng sẽ biến mất nên là không lấy), bao gồm Id, tên bài thi, môn học, thời gian, ngày thi, ca thi(trả về name), phòng thi(trả về name) và mặc định các bài thi đó lấy theo năm mới nhất và kỳ học mới nhất của sinh viên, có phân trang và sẽ lọc theo tên của tên của bài thi, Tại sao có ca thi và phòng thi, nếu như giữa kỳ thì sẽ không có nhưng bởi vì đầu điểm sẽ không biết bài nào là giữa kỳ và cuối kỳ nên sẽ phải join thêm bảng ExamSlotRoom để kiểm tra rằng có examId trong đó hay không
        [HttpGet("student-exams/multiexam")]
        public async Task<IActionResult> GetAllMultiExamOfStudent([FromQuery] ExamFilterRequest request)
        {
            if (request.StudentId == Guid.Empty)
                return BadRequest("StudentId không được để trống!");

            var result = await _examService.GetAllMultiExamOfStudentAsync(request);
            return Ok(result);
        }

        [HttpGet("student-exams/pracexam")]
        public async Task<IActionResult> GetAllPracticeExamOfStudent([FromQuery] ExamFilterRequest request)
        {
            if (request.StudentId == Guid.Empty)
                return BadRequest("StudentId không được để trống!");

            var result = await _examService.GetAllPracExamOfStudentAsync(request);
            return Ok(result);
        }

        /// <summary>
        /// API kiểm tra trạng thái của multiexam và practice exam - đơn giản cho desktop app polling
        /// Trả về trạng thái hiện tại: "Chưa mở ca", "Đang mở ca", "Đã đóng ca", etc.
        /// </summary>
        /// <param name="request">Request chứa danh sách exam IDs và loại exam cần check</param>
        /// <returns>Danh sách exam với trạng thái hiện tại</returns>
        [HttpPost("check-status")]
        public async Task<IActionResult> CheckExamStatus([FromBody] ExamStatusCheckRequestDTO request)
        {
            if (request == null || request.ExamIds == null || !request.ExamIds.Any())
                return BadRequest("ExamIds không được để trống!");

            try
            {
                var result = await _examService.CheckExamStatusAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Có lỗi xảy ra khi kiểm tra trạng thái bài thi: {ex.Message}");
            }
        }
    }
    
}
