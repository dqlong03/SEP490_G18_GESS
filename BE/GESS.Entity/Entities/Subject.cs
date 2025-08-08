using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 10. Subject - Đại diện cho môn học (VD: Toán, Lý, Hóa)
    public class Subject
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SubjectId { get; set; }

        // Tên môn học, không được để trống, tối đa 100 ký tự
        [Required(ErrorMessage = "Tên môn học không được để trống!")]
        [StringLength(100, ErrorMessage = "Tên môn học không được vượt quá 100 ký tự!")]
        public string SubjectName { get; set; }

        // Mô tả môn học, tối đa 500 ký tự
        [StringLength(500, ErrorMessage = "Mô tả không được vượt quá 500 ký tự!")]
        public string Description { get; set; }

        // Khóa học của môn (VD: "CS101"), tối đa 20 ký tự
        [StringLength(20, ErrorMessage = "Khóa học không được vượt quá 20 ký tự!")]
        public string Course { get; set; }

        // Tổng số tín chỉ của môn học, không được để trống
        [Required(ErrorMessage = "Tổng số tín chỉ không được để trống!")]
        public int NoCredits { get; set; }

        // Danh sách chương trình đào tạo có môn học này (qua bảng trung gian SubjectTrainingProgram)
        public ICollection<SubjectTrainingProgram> SubjectTrainingPrograms { get; set; }

        // Danh sách môn tiền điều kiện của môn học này (qua bảng trung gian PreconditionSubject)
        public ICollection<PreconditionSubject> PreconditionSubjects { get; set; }

        // Danh sách danh mục kỳ thi có môn học này (qua bảng trung gian CategoryExamSubject)
        public ICollection<CategoryExamSubject> CategoryExamSubjects { get; set; }

        // Danh sách chương thuộc môn học này
        public ICollection<Chapter> Chapters { get; set; }

        // Danh sách kỳ thi trắc nghiệm thuộc môn học này
        public ICollection<MultiExam> MultiExams { get; set; }

        // Danh sách kỳ thi tự luận thuộc môn học này
        public ICollection<PracticeExam> PracticeExams { get; set; }

        // Danh sách đề thi tự luận thuộc môn học này
        public ICollection<PracticeExamPaper> PracticeExamPapers { get; set; }

        // Danh sách lớp học (Class) của môn học này (qua bảng trung gian Class)
        public ICollection<Class> Classes { get; set; }

        // Constructor khởi tạo các danh sách
        public ICollection<ExamSlotRoom> ExamSlotRooms { get; set; }

        public Subject()
        {
            ExamSlotRooms = new List<ExamSlotRoom>();
            SubjectTrainingPrograms = new List<SubjectTrainingProgram>();
            PreconditionSubjects = new List<PreconditionSubject>();
            CategoryExamSubjects = new List<CategoryExamSubject>();
            Chapters = new List<Chapter>();
            MultiExams = new List<MultiExam>();
            PracticeExams = new List<PracticeExam>();
            PracticeExamPapers = new List<PracticeExamPaper>();
            Classes = new List<Class>();
        }
    }
}
