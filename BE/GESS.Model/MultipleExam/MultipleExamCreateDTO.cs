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
    // Custom validation attribute để kiểm tra StartDay < EndDay
    public class StartDayBeforeEndDayAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var instance = validationContext.ObjectInstance as MultipleExamCreateDTO;
            if (instance != null)
            {
                if (instance.StartDay >= instance.EndDay)
                {
                    return new ValidationResult("Thời gian bắt đầu phải trước thời gian kết thúc!");
                }
            }
            return ValidationResult.Success;
        }
    }

    public class MultipleExamCreateDTO
    {
        // Tên kỳ thi trắc nghiệm, không được để trống, tối đa 100 ký tự
        [Required(ErrorMessage = "Tên kỳ thi không được để trống!")]
        [StringLength(100, ErrorMessage = "Tên kỳ thi không được vượt quá 100 ký tự!")]
        public string MultiExamName { get; set; }

        // Số lượng câu hỏi trong kỳ thi, không được để trống
        [Required(ErrorMessage = "Số lượng câu hỏi không được để trống!")]
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng câu hỏi phải lớn hơn 0!")]
        public int NumberQuestion { get; set; }

        // Thời gian làm bài (phút), không được để trống
        [Required(ErrorMessage = "Thời gian làm bài không được để trống!")]
        [Range(1, 480, ErrorMessage = "Thời gian làm bài phải từ 1 đến 480 phút!")]
        public int Duration { get; set; }
        //Ngày thi, không được để trống
        [Required(ErrorMessage = "Ngày thi không được để trống!")]
        public DateTime StartDay { get; set; }
        
        [Required(ErrorMessage = "Ngày kết thúc thi không được để trống!")]
        [StartDayBeforeEndDay]
        public DateTime EndDay { get; set; }

        // Ngày tạo kỳ thi, không được để trống
        [Required(ErrorMessage = "Ngày tạo không được để trống!")]
        public DateTime CreateAt { get; set; }

        [Required(ErrorMessage = "TeacherId không được để trống!")]
        public Guid TeacherId { get; set; }

        // Khóa ngoại liên kết đến môn học (Subject), 1 kỳ thi thuộc 1 môn học
        [Required(ErrorMessage = "SubjectId không được để trống!")]
        [Range(1, int.MaxValue, ErrorMessage = "SubjectId phải lớn hơn 0!")]
        public int SubjectId { get; set; }

        //Thêm
        [Required(ErrorMessage = "ClassId không được để trống!")]
        [Range(1, int.MaxValue, ErrorMessage = "ClassId phải lớn hơn 0!")]
        public int ClassId { get; set; }

        // Khóa ngoại liên kết đến danh mục kỳ thi (CategoryExam), 1 kỳ thi thuộc 1 danh mục
        [Required(ErrorMessage = "CategoryExamId không được để trống!")]
        [Range(1, int.MaxValue, ErrorMessage = "CategoryExamId phải lớn hơn 0!")]
        public int CategoryExamId { get; set; }

        // Khóa ngoại liên kết đến học kỳ (Semester), 1 kỳ thi thuộc 1 học kỳ
        [Required(ErrorMessage = "SemesterId không được để trống!")]
        [Range(1, int.MaxValue, ErrorMessage = "SemesterId phải lớn hơn 0!")]
        public int SemesterId { get; set; }
        // Trạng thái công khai của kỳ thi (true = công khai, false = không công khai)
        [Column(TypeName = "BIT")]
        public bool IsPublish { get; set; }
        [Required(ErrorMessage = "Danh sách cấu hình câu hỏi không được để trống!")]
        public ICollection<NoQuestionInChapterDTO> NoQuestionInChapterDTO { get; set; }
        
        public ICollection<StudentExamDTO> StudentExamDTO { get; set; }
    }
    public class FinalMultipleExamCreateDTO
    {
        // Tên kỳ thi trắc nghiệm, không được để trống, tối đa 100 ký tự
        [Required(ErrorMessage = "Tên kỳ thi không được để trống!")]
        [StringLength(100, ErrorMessage = "Tên kỳ thi không được vượt quá 100 ký tự!")]
        public string MultiExamName { get; set; }

        // Số lượng câu hỏi trong kỳ thi, không được để trống
        [Required(ErrorMessage = "Số lượng câu hỏi không được để trống!")]
        public int NumberQuestion { get; set; }

        // Ngày tạo kỳ thi, không được để trống
        [Required(ErrorMessage = "Ngày tạo không được để trống!")]
        public DateTime CreateAt { get; set; }

        public Guid TeacherId { get; set; }

        // Khóa ngoại liên kết đến môn học (Subject), 1 kỳ thi thuộc 1 môn học
        public int SubjectId { get; set; }

        // Khóa ngoại liên kết đến học kỳ (Semester), 1 kỳ thi thuộc 1 học kỳ
        public int SemesterId { get; set; }

        public ICollection<NoQuestionInChapterDTO> NoQuestionInChapterDTO { get; set; }
    }
    public class MultipleExamResponseDTO
    {
        public int MultiExamId { get; set; }
        // Tên kỳ thi trắc nghiệm, không được để trống, tối đa 100 ký tự
        [Required(ErrorMessage = "Tên kỳ thi không được để trống!")]
        [StringLength(100, ErrorMessage = "Tên kỳ thi không được vượt quá 100 ký tự!")]
        public string MultiExamName { get; set; }

        // Số lượng câu hỏi trong kỳ thi, không được để trống
        [Required(ErrorMessage = "Số lượng câu hỏi không được để trống!")]
        public int NumberQuestion { get; set; }

        // Ngày tạo kỳ thi, không được để trống
        [Required(ErrorMessage = "Ngày tạo không được để trống!")]
        public DateTime CreateAt { get; set; }

        public Guid TeacherId { get; set; }
        public string TeacherName { get; set; }

        // Khóa ngoại liên kết đến môn học (Subject), 1 kỳ thi thuộc 1 môn học
        public int SubjectId { get; set; }
        public string SubjectName { get; set; }

        // Khóa ngoại liên kết đến học kỳ (Semester), 1 kỳ thi thuộc 1 học kỳ
        public int SemesterId { get; set; }
        public string SemesterName { get; set; }
        // Trạng thái công khai của kỳ thi (true = công khai, false = không công khai)
        [Column(TypeName = "BIT")]
        public ICollection<NoQuestionInChapterDTO> NoQuestionInChapterDTO { get; set; }
    }
}
