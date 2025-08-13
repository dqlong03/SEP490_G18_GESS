using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Exam
{
    public class ExamStatusCheckResponseDTO
    {
        public int ExamId { get; set; }
        public string ExamName { get; set; } = string.Empty;
        public string ExamType { get; set; } = string.Empty; // "MultiExam" hoặc "PracticeExam"
        public string Status { get; set; } = string.Empty; // "Chưa mở ca", "Đang mở ca", "Đã đóng ca", etc.
    }

    public class ExamStatusCheckRequestDTO
    {
        public List<int> ExamIds { get; set; } = new List<int>();
        public string? ExamType { get; set; } // "Multi", "Practice", hoặc null để check cả 2
    }

    public class ExamStatusCheckListResponseDTO
    {
        public List<ExamStatusCheckResponseDTO> Exams { get; set; } = new List<ExamStatusCheckResponseDTO>();
    }
}
