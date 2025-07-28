using System;
using System.Collections.Generic;

namespace GESS.Model.Class
{
    public class ClassDetailResponseDTO
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; }
        public List<StudentInClassDTO> Students { get; set; }
        public List<ExamInClassDTO> Exams { get; set; }
    }

    public class StudentInClassDTO
    {
        public Guid StudentId { get; set; }
        public string FullName { get; set; }
        public string? AvatarURL { get; set; }
        public string? Code { get; set; } // Mã người dùng
    }

    public class ExamInClassDTO
    {
        public int ExamId { get; set; }
        public string ExamName { get; set; }
        public string GradeComponent { get; set; }
        public int Duration { get; set; }         // Thời lượng
        public int QuestionCount { get; set; }    // Số câu hỏi
        public string ExamType { get; set; }      // "Practice" hoặc "Multi"
        public string IsGraded { get; set; }         // 1: đã chấm, 0: chưa chấm
        public string? Status { get; set; }           // Lấy từ cột status trong DB
        public int StudentCount { get; set; }
    }
}
