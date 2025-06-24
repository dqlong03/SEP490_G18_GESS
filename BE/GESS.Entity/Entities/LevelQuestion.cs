using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 24. LevelQuestion - Đại diện cho cấp độ câu hỏi (VD: Dễ, Trung bình, Khó)
    public class LevelQuestion
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LevelQuestionId { get; set; }

        // Tên cấp độ, không được để trống, tối đa 50 ký tự
        [Required(ErrorMessage = "Tên cấp độ không được để trống!")]
        [StringLength(50, ErrorMessage = "Tên cấp độ không được vượt quá 50 ký tự!")]
        public string LevelQuestionName { get; set; }

        // Danh sách câu hỏi trắc nghiệm thuộc cấp độ này
        public ICollection<MultiQuestion> MultiQuestions { get; set; }

        // Danh sách câu hỏi tự luận thuộc cấp độ này
        public ICollection<PracticeQuestion> PracticeQuestions { get; set; }
        public double Score { get; set; }

        // Constructor khởi tạo các danh sách
        public LevelQuestion()
        {
            MultiQuestions = new List<MultiQuestion>();
            PracticeQuestions = new List<PracticeQuestion>();
        }
    }
}
