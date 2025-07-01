using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 28. PracticeExamPaper - Đại diện cho đề thi tự luận
    public class PracticeExamPaper
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PracExamPaperId { get; set; }

        // Tên đề thi tự luận, không được để trống, tối đa 100 ký tự
        [Required(ErrorMessage = "Tên đề thi không được để trống!")]
        [StringLength(100, ErrorMessage = "Tên đề thi không được vượt quá 100 ký tự!")]
        public string PracExamPaperName { get; set; }

        // Số lượng câu hỏi trong đề thi, không được để trống
        [Required(ErrorMessage = "Số lượng câu hỏi không được để trống!")]
        public int NumberQuestion { get; set; }

        // Ngày tạo đề thi, không được để trống
        [Required(ErrorMessage = "Ngày tạo không được để trống!")]
        public DateTime CreateAt { get; set; }

        // Trạng thái đề thi (VD: "Draft", "Published"), tối đa 20 ký tự
        [StringLength(20, ErrorMessage = "Trạng thái không được vượt quá 20 ký tự!")]
        public string Status { get; set; }

        // Người tạo đề thi, tối đa 50 ký tự
        public Guid TeacherId { get; set; }
        public Teacher Teacher { get; set; }

        // Khóa ngoại liên kết đến danh mục kỳ thi (CategoryExam), 1 đề thi thuộc 1 danh mục
        public int CategoryExamId { get; set; }
        public CategoryExam CategoryExam { get; set; }

        // Khóa ngoại liên kết đến môn học (Subject), 1 đề thi thuộc 1 môn học
        public int SubjectId { get; set; }
        public Subject Subject { get; set; }

        // Khóa ngoại liên kết đến học kỳ (Semester), 1 đề thi thuộc 1 học kỳ
        public int SemesterId { get; set; }
        public Semester Semester { get; set; }

        // Danh sách câu hỏi trong đề thi này (qua bảng trung gian PracticeTestQuestion)
        public ICollection<PracticeTestQuestion> PracticeTestQuestions { get; set; }

        // Danh sách kỳ thi tự luận sử dụng đề thi này (qua bảng trung gian NoPEPaperInPE)
        public ICollection<NoPEPaperInPE> NoPEPaperInPEs { get; set; }

        // Danh sách lịch sử thi của sinh viên sử dụng đề thi này
        public ICollection<PracticeExamHistory> PracticeExamHistories { get; set; }

        // Constructor khởi tạo các danh sách
        public PracticeExamPaper()
        {
            PracticeTestQuestions = new List<PracticeTestQuestion>();
            NoPEPaperInPEs = new List<NoPEPaperInPE>();
            PracticeExamHistories = new List<PracticeExamHistory>();
        }
    }
}
