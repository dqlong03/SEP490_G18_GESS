using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 34. QuestionMultiExam - Bảng trung gian giữa MultiExamHistory và MultiQuestion (liên kết lịch sử thi với câu hỏi trắc nghiệm)
    public class QuestionMultiExam
    {
        // Khóa ngoại liên kết đến lịch sử thi trắc nghiệm (MultiExamHistory)
        public Guid MultiExamHistoryId { get; set; }
        public virtual MultiExamHistory MultiExamHistory { get; set; }

        // Khóa ngoại liên kết đến câu hỏi trắc nghiệm (MultiQuestion)
        public int MultiQuestionId { get; set; }
        public virtual MultiQuestion MultiQuestion { get; set; }

        // Thứ tự câu hỏi trong bài thi của sinh viên, không được để trống
        [Required(ErrorMessage = "Thứ tự câu hỏi không được để trống!")]
        public int QuestionOrder { get; set; }

        // Câu trả lời của sinh viên cho câu hỏi này, tối đa 500 ký tự
        [StringLength(500, ErrorMessage = "Câu trả lời không được vượt quá 500 ký tự!")]
        public string Answer { get; set; }

        // Điểm số của câu hỏi này trong bài thi của sinh viên, không được để trống
        [Required(ErrorMessage = "Điểm số không được để trống!")]
        public double Score { get; set; }
    }
}
