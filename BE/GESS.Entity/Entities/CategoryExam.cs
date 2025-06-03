using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 5. CategoryExam - Đại diện cho danh mục kỳ thi (VD: Thi giữa kỳ, Thi cuối kỳ)
    public class CategoryExam
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CategoryExamId { get; set; }

        // Tên danh mục kỳ thi, không được để trống, tối đa 50 ký tự
        [Required(ErrorMessage = "Tên danh mục kỳ thi không được để trống!")]
        [StringLength(50, ErrorMessage = "Tên danh mục kỳ thi không được vượt quá 50 ký tự!")]
        public string CategoryExamName { get; set; }

        // Danh sách môn học thuộc danh mục kỳ thi này (qua bảng trung gian CategoryExamSubject)
        public ICollection<CategoryExamSubject> CategoryExamSubjects { get; set; }

        // Danh sách kỳ thi trắc nghiệm thuộc danh mục này
        public ICollection<MultiExam> MultiExams { get; set; }

        // Danh sách câu hỏi trắc nghiệm thuộc danh mục này
        public ICollection<MultiQuestion> MultiQuestions { get; set; }

        // Danh sách kỳ thi tự luận thuộc danh mục này
        public ICollection<PracticeExam> PracticeExams { get; set; }

        // Danh sách đề thi tự luận thuộc danh mục này
        public ICollection<PracticeExamPaper> PracticeExamPapers { get; set; }

        // Constructor khởi tạo các danh sách
        public CategoryExam()
        {
            CategoryExamSubjects = new List<CategoryExamSubject>();
            MultiExams = new List<MultiExam>();
            MultiQuestions = new List<MultiQuestion>();
            PracticeExams = new List<PracticeExam>();
            PracticeExamPapers = new List<PracticeExamPaper>();
        }
    }
}
