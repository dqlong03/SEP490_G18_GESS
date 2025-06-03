using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 16. Student - Đại diện cho sinh viên
    public class Student
    {
        // Khóa chính, tự động tăng
        [Key]
        public Guid StudentId { get; set; }

        // Khóa ngoại liên kết đến người dùng (User), không được để trống
        [Required(ErrorMessage = "UserId không được để trống!")]
        public int UserId { get; set; }

        // Ngày nhập học, không được để trống
        [Required(ErrorMessage = "Ngày nhập học không được để trống!")]
        public DateTime EnrollDate { get; set; }

        // Ngày kết thúc học (có thể để trống nếu sinh viên vẫn đang học)
        public DateTime? EndDate { get; set; }

        // Khóa ngoại liên kết đến niên khóa (Cohort), không được để trống
        [Required(ErrorMessage = "Niên khóa không được để trống!")]
        public int CohortId { get; set; }
        public Cohort Cohort { get; set; }

        // Danh sách lớp học mà sinh viên tham gia (qua bảng trung gian ClassStudent)
        public ICollection<ClassStudent> ClassStudents { get; set; }

        // Lịch sử thi trắc nghiệm của sinh viên (qua bảng trung gian MultiExamHistory)
        public ICollection<MultiExamHistory> MultiExamHistories { get; set; }

        // Lịch sử thi tự luận của sinh viên (qua bảng trung gian PracticeExamHistory)
        public ICollection<PracticeExamHistory> PracticeExamHistories { get; set; }

        // Constructor khởi tạo các danh sách
        public Student()
        {
            ClassStudents = new List<ClassStudent>();
            MultiExamHistories = new List<MultiExamHistory>();
            PracticeExamHistories = new List<PracticeExamHistory>();
        }
    }
}
