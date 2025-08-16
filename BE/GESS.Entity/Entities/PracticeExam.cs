using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 30. PracticeExam - Đại diện cho kỳ thi tự luận
    public class PracticeExam
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PracExamId { get; set; }

        // Tên kỳ thi tự luận, không được để trống, tối đa 100 ký tự
        [Required(ErrorMessage = "Tên kỳ thi không được để trống!")]
        [StringLength(100, ErrorMessage = "Tên kỳ thi không được vượt quá 100 ký tự!")]
        public string PracExamName { get; set; }

        // Thời gian làm bài (phút), không được để trống
        [Required(ErrorMessage = "Thời gian làm bài không được để trống!")]
        public int Duration { get; set; }
        //Ngày thi, không được để trống
        [Required(ErrorMessage = "Ngày thi không được để trống!")]
        public DateTime? StartDay { get; set; }
        public DateTime? EndDay { get; set; }

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

        // Người tạo kỳ thi, tối đa 50 ký tự
        public Guid TeacherId { get; set; }
        public Teacher Teacher { get; set; }

        // Khóa ngoại liên kết đến danh mục kỳ thi (CategoryExam), 1 kỳ thi thuộc 1 danh mục
        public int CategoryExamId { get; set; }
        public CategoryExam CategoryExam { get; set; }

        // Khóa ngoại liên kết đến môn học (Subject), 1 kỳ thi thuộc 1 môn học
        public int SubjectId { get; set; }
        public Subject Subject { get; set; }

        // Khóa ngoại liên kết đến học kỳ (Semester), 1 kỳ thi thuộc 1 học kỳ
        public int SemesterId { get; set; }
        public Semester Semester { get; set; }

        // Khóa ngoại liên kết đến lớp học (Class), 1 kỳ thi thuộc 1 lớp học
        public int ? ClassId { get; set; }
        public Class ? Class { get; set; }

        // Danh sách đề thi tự luận được sử dụng trong kỳ thi này (qua bảng trung gian NoPEPaperInPE)
        public ICollection<NoPEPaperInPE> NoPEPaperInPEs { get; set; }

        // Lịch sử thi của sinh viên trong kỳ thi này (qua bảng trung gian PracticeExamHistory)
        public ICollection<PracticeExamHistory> PracticeExamHistories { get; set; }
        public ICollection<ExamSlotRoom> ExamSlotRooms { get; set; } // thêm navigation

        // Constructor khởi tạo các danh sách
        public PracticeExam()
        {
            ExamSlotRooms = new List<ExamSlotRoom>();
            NoPEPaperInPEs = new List<NoPEPaperInPE>();
            PracticeExamHistories = new List<PracticeExamHistory>();
        }
    }

}
