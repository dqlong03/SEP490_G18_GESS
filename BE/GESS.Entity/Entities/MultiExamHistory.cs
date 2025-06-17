using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 21. MultiExamHistory - Bảng trung gian giữa MultiExam và Student (lịch sử thi trắc nghiệm của sinh viên)
    public class MultiExamHistory
    {
        // Khóa chính, tự động tăng
        [Key]
        public Guid ExamHistoryId { get; set; }

        // Thời gian bắt đầu làm bài, không được để trống
        public DateTime ? StartTime { get; set; }

        // Thời gian kết thúc làm bài, không được để trống
        public DateTime ? EndTime { get; set; }

        // Điểm số của sinh viên, không được để trống
        public double ? Score { get; set; }

        // Trạng thái điểm danh (true = đã điểm danh, false = chưa điểm danh)
        [Column(TypeName = "BIT")]
        public bool CheckIn { get; set; }

        // Trạng thái bài thi (VD: "Completed", "InProgress"), tối đa 20 ký tự
        [StringLength(20, ErrorMessage = "Trạng thái bài thi không được vượt quá 20 ký tự!")]
        public string ? StatusExam { get; set; }

        // Trạng thái chấm điểm (true = đã chấm, false = chưa chấm)
        [Column(TypeName = "BIT")]
        public bool IsGrade { get; set; }

        // Khóa ngoại liên kết đến phòng thi và ca thi (ExamSlotRoom) - có thể null
        public int? ExamSlotRoomId { get; set; }
        public ExamSlotRoom? ExamSlotRoom { get; set; }

        // Khóa ngoại liên kết đến kỳ thi trắc nghiệm (MultiExam)
        public int MultiExamId { get; set; }
        public MultiExam MultiExam { get; set; }

        // Khóa ngoại liên kết đến sinh viên (Student)
        public Guid StudentId { get; set; }
        public Student Student { get; set; }

        // Danh sách câu hỏi trắc nghiệm mà sinh viên đã làm (qua bảng trung gian QuestionMultiExam)
        public ICollection<QuestionMultiExam> QuestionMultiExams { get; set; }

        // Constructor khởi tạo danh sách
        public MultiExamHistory()
        {
            QuestionMultiExams = new List<QuestionMultiExam>();
        }
    }
}
