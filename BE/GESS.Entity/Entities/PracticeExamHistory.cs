using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 32. PracticeExamHistory - Bảng trung gian giữa PracticeExam và Student (lịch sử thi tự luận của sinh viên)
    public class PracticeExamHistory
    {
        // Khóa chính, tự động tăng
        [Key]
        public Guid PracExamHistoryId { get; set; }

        public DateTime ? StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public double ? Score { get; set; }

        // Trạng thái điểm danh (true = đã điểm danh, false = chưa điểm danh)
        [Column(TypeName = "BIT")]
        public bool CheckIn { get; set; }

        public string ? StatusExam { get; set; }

        // Trạng thái chấm điểm (true = đã chấm, false = chưa chấm)
        [Column(TypeName = "BIT")]
        public bool IsGraded { get; set; }
        
        // Khóa ngoại liên kết đến phòng thi và ca thi (ExamSlotRoom) - có thể null
        public int? ExamSlotRoomId { get; set; }
        public ExamSlotRoom? ExamSlotRoom { get; set; }
        
        // Khóa ngoại liên kết đến kỳ thi tự luận (PracticeExam)
        public int PracExamId { get; set; }
        public PracticeExam PracticeExam { get; set; }

        // Khóa ngoại liên kết đến sinh viên (Student)
        public Guid StudentId { get; set; }
        public Student Student { get; set; }

        // Khóa ngoại liên kết đến đề thi tự luận (PracticeExamPaper) - một sinh viên trong một bài thi chỉ có một đề thi
        public int? PracExamPaperId { get; set; }
        public PracticeExamPaper? PracticeExamPaper { get; set; }

        // Danh sách câu hỏi tự luận mà sinh viên đã làm (qua bảng trung gian QuestionPracExam)
        public ICollection<QuestionPracExam> QuestionPracExams { get; set; }

        // Constructor khởi tạo danh sách
        public PracticeExamHistory()
        {
            QuestionPracExams = new List<QuestionPracExam>();
        }
    }
}
