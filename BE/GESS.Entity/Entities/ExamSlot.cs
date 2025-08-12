using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GESS.Entity.Entities
{
    // 13. ExamSlot - Đại diện cho ca thi (VD: Ca 1: 7h-9h)
    public class ExamSlot
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ExamSlotId { get; set; }

        // Tên ca thi, không được để trống, tối đa 50 ký tự
        [Required(ErrorMessage = "Tên ca thi không được để trống!")]
        [StringLength(50, ErrorMessage = "Tên ca thi không được vượt quá 50 ký tự!")]
        public string SlotName { get; set; }

        [Column(TypeName = "time")]
        public TimeSpan StartTime { get; set; }

        [Column(TypeName = "time")]
        public TimeSpan EndTime { get; set; }

        [StringLength(100)]
        public string Status { get; set; } = "Chưa gán bài thi"; // Trạng thái ca thi, mặc định là "Chưa gán bài thi"

        [StringLength(50)]
        public string? MultiOrPractice { get; set; }

        // Khóa ngoại đến Subject (bắt buộc)
        public int SubjectId { get; set; }
        public Subject Subject { get; set; } = null!;

        // Khóa ngoại đến Semester (bắt buộc)
        public int SemesterId { get; set; }
        public Semester Semester { get; set; } = null!;

        // Ngày thi
        [Column(TypeName = "date")]
        public DateTime ExamDate { get; set; }

        // Khóa ngoại đến PracticeExam (nếu có)
        public int? PracticeExamId { get; set; }
        public PracticeExam? PracticeExam { get; set; }

        // Khóa ngoại đến MultiExam (nếu có)
        public int? MultiExamId { get; set; }
        public MultiExam? MultiExam { get; set; }

        // Danh sách phòng thi cho ca thi này (qua bảng trung gian ExamSlotRoom)
        public ICollection<ExamSlotRoom> ExamSlotRooms { get; set; } = new List<ExamSlotRoom>();
    }
}
