using GESS.Entity.Entities;
using GESS.Model.Class;
using GESS.Model.NoQuestionInChapter;
using GESS.Model.Student;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.MultipleExam
{
    public class MultipleExamCreateDTO
    {
        // Tên kỳ thi trắc nghiệm, không được để trống, tối đa 100 ký tự
        [Required(ErrorMessage = "Tên kỳ thi không được để trống!")]
        [StringLength(100, ErrorMessage = "Tên kỳ thi không được vượt quá 100 ký tự!")]
        public string MultiExamName { get; set; }

        // Số lượng câu hỏi trong kỳ thi, không được để trống
        [Required(ErrorMessage = "Số lượng câu hỏi không được để trống!")]
        public int NumberQuestion { get; set; }

        // Thời gian làm bài (phút), không được để trống
        [Required(ErrorMessage = "Thời gian làm bài không được để trống!")]
        public int Duration { get; set; }

        // Ngày tạo kỳ thi, không được để trống
        [Required(ErrorMessage = "Ngày tạo không được để trống!")]
        public DateTime CreateAt { get; set; }

        public Guid TeacherId { get; set; }

        // Khóa ngoại liên kết đến môn học (Subject), 1 kỳ thi thuộc 1 môn học
        public int SubjectId { get; set; }

        // Khóa ngoại liên kết đến danh mục kỳ thi (CategoryExam), 1 kỳ thi thuộc 1 danh mục
        public int CategoryExamId { get; set; }

        // Khóa ngoại liên kết đến học kỳ (Semester), 1 kỳ thi thuộc 1 học kỳ
        public int SemesterId { get; set; }
        // Trạng thái công khai của kỳ thi (true = công khai, false = không công khai)
        [Column(TypeName = "BIT")]
        public bool IsPublish { get; set; }
        public ICollection<NoQuestionInChapterDTO> NoQuestionInChapterDTO { get; set; }
        public ICollection<StudentExamDTO> StudentExamDTO { get; set; }
    }
}
