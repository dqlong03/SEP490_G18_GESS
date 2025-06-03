using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 29. PracticeTestQuestion - Bảng trung gian giữa PracticeQuestion và PracticeExamPaper (liên kết câu hỏi tự luận với đề thi)
    public class PracticeTestQuestion
    {
        // Khóa ngoại liên kết đến đề thi tự luận (PracticeExamPaper)
        public int PracExamPaperId { get; set; }
        public PracticeExamPaper PracticeExamPaper { get; set; }

        // Khóa ngoại liên kết đến câu hỏi tự luận (PracticeQuestion)
        public int PracticeQuestionId { get; set; }
        public PracticeQuestion PracticeQuestion { get; set; }

        // Thứ tự câu hỏi trong đề thi, không được để trống
        [Required(ErrorMessage = "Thứ tự câu hỏi không được để trống!")]
        public int QuestionOrder { get; set; }

        // Điểm số tối đa của câu hỏi trong đề thi, không được để trống
        [Required(ErrorMessage = "Điểm số không được để trống!")]
        public double Score { get; set; }
    }
}
