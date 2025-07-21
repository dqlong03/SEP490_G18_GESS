using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 26. PracticeQuestion - Đại diện cho câu hỏi tự luận
    public class PracticeQuestion
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PracticeQuestionId { get; set; }

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

        public Guid CreatedBy { get; set; }
        public User User { get; set; }

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

        // Đáp án của câu hỏi tự luận này (1 câu hỏi tự luận có 1 đáp án)
        public PracticeAnswer PracticeAnswer { get; set; }

        // Danh sách đề thi tự luận có câu hỏi này (qua bảng trung gian PracticeTestQuestion)
        public ICollection<PracticeTestQuestion> PracticeTestQuestions { get; set; }

        // Danh sách lịch sử thi có câu hỏi này (qua bảng trung gian QuestionPracExam)
        public ICollection<QuestionPracExam> QuestionPracExams { get; set; }

        // Constructor khởi tạo các danh sách
        public PracticeQuestion()
        {
            PracticeTestQuestions = new List<PracticeTestQuestion>();
            QuestionPracExams = new List<QuestionPracExam>();
        }
    }

}
