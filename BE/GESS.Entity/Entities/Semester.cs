using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 19. Semester - Đại diện cho học kỳ (VD: Học kỳ 1 năm 2025)
    public class Semester
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SemesterId { get; set; }

        // Tên học kỳ, không được để trống, tối đa 50 ký tự
        [Required(ErrorMessage = "Tên học kỳ không được để trống!")]
        [StringLength(50, ErrorMessage = "Tên học kỳ không được vượt quá 50 ký tự!")]
        public string SemesterName { get; set; }

        [Column(TypeName = "BIT")]

        public bool IsActive { get; set; }

        // Danh sách lớp học trong học kỳ này
        public ICollection<Class> Classes { get; set; }

        // Danh sách đề thi tự luận trong học kỳ này
        public ICollection<PracticeExamPaper> PracticeExamPapers { get; set; }

        // Danh sách câu hỏi trắc nghiệm trong học kỳ này
        public ICollection<MultiQuestion> MultiQuestions { get; set; }

        // Danh sách câu hỏi tự luận trong học kỳ này
        public ICollection<PracticeQuestion> PracticeQuestions { get; set; }

        // Danh sách kỳ thi tự luận trong học kỳ này
        public ICollection<PracticeExam> PracticeExams { get; set; }

        // Danh sách kỳ thi trắc nghiệm trong học kỳ này
        public ICollection<MultiExam> MultiExams { get; set; }

        // Danh sách phòng thi và ca thi trong học kỳ này (qua bảng trung gian ExamSlotRoom)
        public ICollection<ExamSlotRoom> ExamSlotRooms { get; set; }

        // Constructor khởi tạo các danh sách
        public Semester()
        {
            Classes = new List<Class>();
            PracticeExamPapers = new List<PracticeExamPaper>();
            MultiQuestions = new List<MultiQuestion>();
            PracticeQuestions = new List<PracticeQuestion>();
            PracticeExams = new List<PracticeExam>();
            MultiExams = new List<MultiExam>();
            ExamSlotRooms = new List<ExamSlotRoom>();
        }
    }
}
