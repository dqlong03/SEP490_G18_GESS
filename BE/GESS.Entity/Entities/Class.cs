using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 15. Class - Bảng trung gian giữa Subject và Teacher (liên kết môn học với giáo viên để tạo lớp học)
    public class Class
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ClassId { get; set; }

        // Khóa ngoại liên kết đến giáo viên (Teacher)
        public Guid TeacherId { get; set; }
        public Teacher Teacher { get; set; }

        // Khóa ngoại liên kết đến môn học (Subject)
        public int SubjectId { get; set; }
        public Subject Subject { get; set; }

        // Khóa ngoại liên kết đến học kỳ (Semester)
        public int SemesterId { get; set; }
        public Semester Semester { get; set; }
        // Ngày tạo lớp học
        public DateTime? CreatedDate { get; set; }

        // Tên lớp học, không được để trống, tối đa 50 ký tự
        [Required(ErrorMessage = "Tên lớp học không được để trống!")]
        [StringLength(50, ErrorMessage = "Tên lớp học không được vượt quá 50 ký tự!")]
        public string ClassName { get; set; }

        // Danh sách sinh viên trong lớp học này (qua bảng trung gian ClassStudent)
        public ICollection<ClassStudent> ClassStudents { get; set; }

        // Danh sách kỳ thi trắc nghiệm thuộc lớp học này (1 lớp có thể có nhiều kỳ thi trắc nghiệm)
        public ICollection<MultiExam> MultiExams { get; set; }

        // Danh sách kỳ thi tự luận thuộc lớp học này (1 lớp có thể có nhiều kỳ thi tự luận)
        public ICollection<PracticeExam> PracticeExams { get; set; }

        // Constructor khởi tạo danh sách
        public Class()
        {
            ClassStudents = new List<ClassStudent>();
            MultiExams = new List<MultiExam>();
            PracticeExams = new List<PracticeExam>();
        }
    }

}
