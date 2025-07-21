using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 14. ExamSlotRoom - Bảng trung gian giữa ExamSlot và Room (liên kết ca thi với phòng thi)
    public class ExamSlotRoom
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ExamSlotRoomId { get; set; }

        // Khóa ngoại liên kết đến ca thi (ExamSlot)
        public int ExamSlotId { get; set; }
        public int Status { get; set; } = 0; // Trạng thái của ca thi (VD: 0 - Chưa bắt đầu, 1 - Đang diễn ra, 2 - Đã kết thúc)
        public ExamSlot ExamSlot { get; set; }

        public DateTime ExamDate { get; set; }

        // Khóa ngoại liên kết đến phòng thi (Room)
        public int RoomId { get; set; }
        public Room Room { get; set; }

        // Khóa ngoại liên kết đến học kỳ (Semester)
        public int SemesterId { get; set; }
        public Semester Semester { get; set; }

        // Khóa ngoại liên kết đến giáo viên trông thi (Teacher), có thể để trống
        public Guid? SupervisorId { get; set; }
        public Teacher Supervisor { get; set; }

        // Khóa ngoại liên kết đến giáo viên chấm điểm (Teacher), có thể để trống
        public Guid? ExamGradedId { get; set; }
        public Teacher ExamGrader { get; set; }
        // IsGraded: true nếu đã chấm điểm, false nếu chưa chấm điểm
        public int? IsGraded { get; set; }
        // Khóa ngoại liên kết đến môn học (Subject), có thể để trống
        public int? SubjectId { get; set; }
        public Subject Subject { get; set; }

        // Loại kỳ thi (VD: "Multi" cho trắc nghiệm, "Practice" cho tự luận), tối đa 20 ký tự
        [StringLength(20, ErrorMessage = "Loại kỳ thi không được vượt quá 20 ký tự!")]
        public string MultiOrPractice { get; set; }

        // Id của kỳ thi (MultiExamId hoặc PracticeExamId, tùy thuộc vào MultiOrPractice), có thể để trống
        public int? MultiExamId { get; set; }

        public int? PracticeExamId { get; set; }

        // Kỳ thi trắc nghiệm diễn ra ở phòng/ca này (1 phòng/ca chỉ có 1 kỳ thi trắc nghiệm)
        public MultiExam? MultiExam { get; set; }

        // Kỳ thi tự luận diễn ra ở phòng/ca này (1 phòng/ca chỉ có 1 kỳ thi tự luận)
        public PracticeExam? PracticeExam { get; set; }

        // Lịch sử thi của sinh viên trong phòng/ca này (qua bảng trung gian MultiExamHistory)
        public ICollection<MultiExamHistory> MultiExamHistories { get; set; }
        public ICollection<PracticeExamHistory> PracticeExamHistories { get; set; }
        public ICollection<StudentExamSlotRoom> StudentExamSlotRooms { get; set; }

        // Lịch sử thi tự luận của sinh viên trong phòng/ca này (qua bảng trung gian PracticeExamHistory)

        // Constructor khởi tạo danh sách
        public ExamSlotRoom()
        {
            MultiExamHistories = new List<MultiExamHistory>();
            PracticeExamHistories = new List<PracticeExamHistory>();
            StudentExamSlotRooms = new List<StudentExamSlotRoom>();
        }
    }
}
