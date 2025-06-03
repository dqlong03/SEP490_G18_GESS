using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 33. QuestionPracExam - Bảng trung gian giữa PracticeExamHistory và PracticeQuestion (liên kết lịch sử thi với câu hỏi tự luận)
    public class QuestionPracExam
    {
        // Khóa ngoại liên kết đến lịch sử thi tự luận (PracticeExamHistory)
        public Guid PracExamHistoryId { get; set; }
        public PracticeExamHistory PracticeExamHistory { get; set; }

        // Khóa ngoại liên kết đến câu hỏi tự luận (PracticeQuestion)
        public int PracticeQuestionId { get; set; }
        public PracticeQuestion PracticeQuestion { get; set; }

        // Câu trả lời của sinh viên cho câu hỏi này, tối đa 1000 ký tự
        [StringLength(1000, ErrorMessage = "Câu trả lời không được vượt quá 1000 ký tự!")]
        public string Answer { get; set; }

        // Điểm số của câu hỏi này trong bài thi của sinh viên, không được để trống
        [Required(ErrorMessage = "Điểm số không được để trống!")]
        public double Score { get; set; }
    }
}
