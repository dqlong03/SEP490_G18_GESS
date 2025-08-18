using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 27. PracticeAnswer - Đại diện cho đáp án của câu hỏi tự luận
    public class PracticeAnswer
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AnswerId { get; set; }

        // Nội dung đáp án, không được để trống, tối đa 1000 ký tự
        [Required(ErrorMessage = "Nội dung đáp án không được để trống!")]
        [StringLength(1000, ErrorMessage = "Nội dung đáp án không được vượt quá 1000 ký tự!")]
        public string AnswerContent { get; set; }
      
        [StringLength(2000, ErrorMessage = "Tiêu chí chấm điểm không được vượt quá 2000 ký tự!")]
        public string? GradingCriteria { get; set; }
        // Khóa ngoại liên kết đến câu hỏi tự luận (PracticeQuestion), 1 đáp án thuộc 1 câu hỏi
        public int PracticeQuestionId { get; set; }
        public PracticeQuestion PracticeQuestion { get; set; }
    }
}
