using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 7. MultiExam - Đại diện cho kỳ thi trắc nghiệm (VD: Thi cuối kỳ môn Toán)
    public class MultiExam
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MultiExamId { get; set; }

        // Tên kỳ thi trắc nghiệm, không được để trống, tối đa 100 ký tự
        [Required(ErrorMessage = "Tên kỳ thi không được để trống!")]
        [StringLength(100, ErrorMessage = "Tên kỳ thi không được vượt quá 100 ký tự!")]
        public string MultiExamName { get; set; }

        // Số lượng câu hỏi trong kỳ thi, không được để trống
        [Required(ErrorMessage = "Số lượng câu hỏi không được để trống!")]
        public int NumberQuestion { get; set; }

        //Ngày thi, không được để trống
        [Required(ErrorMessage = "Ngày thi không được để trống!")]
        public DateTime? StartDay { get; set; }
        public DateTime? EndDay { get; set; }

        // Thời gian làm bài (phút), không được để trống
        [Required(ErrorMessage = "Thời gian làm bài không được để trống!")]
        public int Duration { get; set; }

        // Ngày tạo kỳ thi, không được để trống
        [Required(ErrorMessage = "Ngày tạo không được để trống!")]
        public DateTime CreateAt { get; set; }

        // Trạng thái kỳ thi (VD: "Draft", "Published"), tối đa 20 ký tự
        [StringLength(20, ErrorMessage = "Trạng thái không được vượt quá 20 ký tự!")]
        public string ? Status { get; set; }
        // Trạng thái chaasm thi (VD: "Done", "Not yet"), tối đa 20 ký tự
        [StringLength(20, ErrorMessage = "Trạng thái không được vượt quá 20 ký tự!")]
        public int IsGraded { get; set; } = 0; // 0 - Chưa chấm, 1 - Đã chấm

        // Mã để bắt đầu kỳ thi, tối đa 50 ký tự
        [StringLength(50, ErrorMessage = "Mã bắt đầu không được vượt quá 50 ký tự!")]
        public string ? CodeStart { get; set; }

        // Khóa ngoại liên kết đến môn học (Teacher), 1 kỳ thi tạo bởi 1 giáo viên
        public Guid TeacherId { get; set; }
        public Teacher Teacher { get; set; }

        // Khóa ngoại liên kết đến môn học (Subject), 1 kỳ thi thuộc 1 môn học
        public int SubjectId { get; set; }
        public Subject Subject { get; set; }

        // Khóa ngoại liên kết đến danh mục kỳ thi (CategoryExam), 1 kỳ thi thuộc 1 danh mục
        public int CategoryExamId { get; set; }
        public CategoryExam CategoryExam { get; set; }

        // Khóa ngoại liên kết đến học kỳ (Semester), 1 kỳ thi thuộc 1 học kỳ
        public int SemesterId { get; set; }
        public Semester Semester { get; set; }

        // Khóa ngoại liên kết đến lớp học (Class), 1 kỳ thi thuộc 1 lớp học
        public int ClassId { get; set; }
        public Class Class { get; set; }

        // Trạng thái công khai của kỳ thi (true = công khai, false = không công khai)
        [Column(TypeName = "BIT")]
        public bool IsPublish { get; set; }

        // Phòng thi và ca thi mà kỳ thi này diễn ra (1 kỳ thi diễn ra ở 1 phòng/ca)
        public ExamSlotRoom ExamSlotRoom { get; set; }

        // Danh sách chương (chapter) được thi trong kỳ thi này (qua bảng trung gian NoQuestionInChapter)
        public ICollection<NoQuestionInChapter> NoQuestionInChapters { get; set; }

        // Danh sách câu hỏi trắc nghiệm trong kỳ thi này (qua bảng trung gian FinalExam)
        public ICollection<FinalExam> FinalExams { get; set; }

        // Lịch sử thi của sinh viên trong kỳ thi này (qua bảng trung gian MultiExamHistory)
        public ICollection<MultiExamHistory> MultiExamHistories { get; set; }

        // Constructor khởi tạo các danh sách
        public MultiExam()
        {
            NoQuestionInChapters = new List<NoQuestionInChapter>();
            FinalExams = new List<FinalExam>();
            MultiExamHistories = new List<MultiExamHistory>();
        }
    }
}
