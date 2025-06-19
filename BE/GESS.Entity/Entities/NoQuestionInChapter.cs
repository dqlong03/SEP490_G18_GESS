using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 9. NoQuestionInChapter - Bảng trung gian giữa MultiExam và Chapter (liên kết kỳ thi trắc nghiệm với chương)
    public class NoQuestionInChapter
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int NoQuesInChapId { get; set; }

        // Khóa ngoại liên kết đến chương (Chapter)
        public int ChapterId { get; set; }
        public Chapter Chapter { get; set; }

        // Khóa ngoại liên kết đến kỳ thi trắc nghiệm (MultiExam)
        public int MultiExamId { get; set; }
        public MultiExam MultiExam { get; set; }
        public int LevelQuestionId { get; set; }
        public LevelQuestion LevelQuestion { get; set; }

        // Số lượng câu hỏi từ chương này trong kỳ thi, không được để trống
        [Required(ErrorMessage = "Số lượng câu hỏi không được để trống!")]
        public int NumberQuestion { get; set; }
    }
}
