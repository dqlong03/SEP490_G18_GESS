using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 8. Chapter - Đại diện cho chương học (VD: Chương 1 môn Toán - Hàm số)
    public class Chapter
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ChapterId { get; set; }

        // Khóa ngoại liên kết đến môn học (Subject), 1 chương thuộc 1 môn học
        public int SubjectId { get; set; }
        public Subject Subject { get; set; }

        // Tên chương, không được để trống, tối đa 100 ký tự
        [Required(ErrorMessage = "Tên chương không được để trống!")]
        [StringLength(100, ErrorMessage = "Tên chương không được vượt quá 100 ký tự!")]
        public string ChapterName { get; set; }

        // Mô tả chương, tối đa 500 ký tự
        [StringLength(500, ErrorMessage = "Mô tả không được vượt quá 500 ký tự!")]
        public string Description { get; set; }

        public string? Course { get; set; }

        // Danh sách câu hỏi trắc nghiệm thuộc chương này
        public ICollection<MultiQuestion> MultiQuestions { get; set; }

        // Danh sách câu hỏi tự luận thuộc chương này
        public ICollection<PracticeQuestion> PracticeQuestions { get; set; }

        // Danh sách kỳ thi trắc nghiệm có chương này (qua bảng trung gian NoQuestionInChapter)
        public ICollection<NoQuestionInChapter> NoQuestionInChapters { get; set; }

        // Constructor khởi tạo các danh sách
        public Chapter()
        {
            MultiQuestions = new List<MultiQuestion>();
            PracticeQuestions = new List<PracticeQuestion>();
            NoQuestionInChapters = new List<NoQuestionInChapter>();
        }
    }
}
