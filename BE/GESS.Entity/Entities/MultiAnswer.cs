using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 23. MultiAnswer - Đại diện cho đáp án của câu hỏi trắc nghiệm
    public class MultiAnswer
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AnswerId { get; set; }

        // Khóa ngoại liên kết đến câu hỏi trắc nghiệm (MultiQuestion), 1 đáp án thuộc 1 câu hỏi
        public int MultiQuestionId { get; set; }
        public MultiQuestion MultiQuestion { get; set; }

        // Nội dung đáp án, không được để trống, tối đa 500 ký tự
        [Required(ErrorMessage = "Nội dung đáp án không được để trống!")]
        [StringLength(500, ErrorMessage = "Nội dung đáp án không được vượt quá 500 ký tự!")]
        public string AnswerContent { get; set; }

        // Đáp án có đúng không (true = đúng, false = sai)
        [Column(TypeName = "BIT")]
        public bool IsCorrect { get; set; }
    }
}
