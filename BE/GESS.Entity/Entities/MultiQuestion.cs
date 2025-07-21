using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 22. MultiQuestion - Đại diện cho câu hỏi trắc nghiệm
    public class MultiQuestion
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MultiQuestionId { get; set; }

        // Nội dung câu hỏi, không được để trống, tối đa 1000 ký tự
        [Required(ErrorMessage = "Nội dung câu hỏi không được để trống!")]
        [StringLength(1000, ErrorMessage = "Nội dung câu hỏi không được vượt quá 1000 ký tự!")]
        public string Content { get; set; }

        // Đường dẫn ảnh (nếu có), tối đa 200 ký tự
        [StringLength(200, ErrorMessage = "Đường dẫn ảnh không được vượt quá 200 ký tự!")]
        public string? UrlImg { get; set; }

        // Trạng thái hoạt động của câu hỏi (true = đang hoạt động, false = không hoạt động)
        [Column(TypeName = "BIT")]
        public bool IsActive { get; set; }

        // Người tạo câu hỏi, tối đa 50 ký tự
        public Guid CreatedBy { get; set; }

        // Trạng thái công khai (true = công khai, false = không công khai)
        [Column(TypeName = "BIT")]
        public bool IsPublic { get; set; }

        // Khóa ngoại liên kết đến chương (Chapter), 1 câu hỏi thuộc 1 chương
        public int ChapterId { get; set; }
        public Chapter Chapter { get; set; }

        // Khóa ngoại liên kết đến danh mục kỳ thi (CategoryExam), 1 câu hỏi thuộc 1 danh mục
        public int CategoryExamId { get; set; }
        public CategoryExam CategoryExam { get; set; }

        // Khóa ngoại liên kết đến cấp độ câu hỏi (LevelQuestion), 1 câu hỏi thuộc 1 cấp độ
        public int LevelQuestionId { get; set; }
        public LevelQuestion LevelQuestion { get; set; }

        // Khóa ngoại liên kết đến học kỳ (Semester), 1 câu hỏi thuộc 1 học kỳ
        public int SemesterId { get; set; }
        public Semester Semester { get; set; }
        // Ngày tạo câu hỏi, không được để trống
        [Required(ErrorMessage = "Ngày tạo không được để trống!")]
        public DateTime CreateAt { get; set; }

        // Danh sách đáp án của câu hỏi trắc nghiệm này
        public ICollection<MultiAnswer> MultiAnswers { get; set; }

        // Danh sách kỳ thi trắc nghiệm có câu hỏi này (qua bảng trung gian FinalExam)
        public ICollection<FinalExam> FinalExams { get; set; }

        // Danh sách lịch sử thi có câu hỏi này (qua bảng trung gian QuestionMultiExam)
        public ICollection<QuestionMultiExam> QuestionMultiExams { get; set; }

        // Constructor khởi tạo các danh sách
        public MultiQuestion()
        {
            MultiAnswers = new List<MultiAnswer>();
            FinalExams = new List<FinalExam>();
            QuestionMultiExams = new List<QuestionMultiExam>();
        }
    }
}
