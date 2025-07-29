using GESS.Entity.Entities;
using GESS.Model.Class;
using GESS.Model.NoQuestionInChapter;
using GESS.Model.PracticeExamPaper;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeExam
{
    public class PracticeExamCreateDTO
    {
        // Tên kỳ thi tự luận, không được để trống, tối đa 100 ký tự
        [Required(ErrorMessage = "Tên kỳ thi không được để trống!")]
        [StringLength(100, ErrorMessage = "Tên kỳ thi không được vượt quá 100 ký tự!")]
        public string PracExamName { get; set; }

        // Thời gian làm bài (phút), không được để trống
        [Required(ErrorMessage = "Thời gian làm bài không được để trống!")]
        public int Duration { get; set; }
        //Ngày thi, không được để trống
        [Required(ErrorMessage = "Ngày thi không được để trống!")]
        public DateTime StartDay { get; set; }
        public DateTime EndDay { get; set; }    

        // Ngày tạo kỳ thi, không được để trống
        [Required(ErrorMessage = "Ngày tạo không được để trống!")]
        public DateTime CreateAt { get; set; }

        // Người tạo kỳ thi, tối đa 50 ký tự
        public Guid TeacherId { get; set; }

        // Khóa ngoại liên kết đến danh mục kỳ thi (CategoryExam), 1 kỳ thi thuộc 1 danh mục
        public int CategoryExamId { get; set; }

        // Khóa ngoại liên kết đến môn học (Subject), 1 kỳ thi thuộc 1 môn học
        public int SubjectId { get; set; }

        public int ClassId { get; set; }
        public string Status { get; set; }


        // Khóa ngoại liên kết đến học kỳ (Semester), 1 kỳ thi thuộc 1 học kỳ
        public int SemesterId { get; set; }
        public ICollection<PracticeExamPaperDTO> PracticeExamPaperDTO { get; set; }
        public ICollection<Guid> StudentIds { get; set; }
        
    }
    public class FinalPracticeExamCreateDTO
    {
        // Tên kỳ thi tự luận, không được để trống, tối đa 100 ký tự
        [Required(ErrorMessage = "Tên kỳ thi không được để trống!")]
        [StringLength(100, ErrorMessage = "Tên kỳ thi không được vượt quá 100 ký tự!")]
        public string PracExamName { get; set; }

        // Người tạo kỳ thi, tối đa 50 ký tự
        public Guid TeacherId { get; set; }

        // Khóa ngoại liên kết đến môn học (Subject), 1 kỳ thi thuộc 1 môn học
        public int SubjectId { get; set; }

        // Khóa ngoại liên kết đến học kỳ (Semester), 1 kỳ thi thuộc 1 học kỳ
        public int SemesterId { get; set; }
        public ICollection<FinalPracticeExamPaperDTO> PracticeExamPaperDTO { get; set; }
    }
    public class FinalExamListDTO
    {
        public int ExamId { get; set; }
        // Tên kỳ thi tự luận, không được để trống, tối đa 100 ký tự
        [Required(ErrorMessage = "Tên kỳ thi không được để trống!")]
        [StringLength(100, ErrorMessage = "Tên kỳ thi không được vượt quá 100 ký tự!")]
        public string ExamName { get; set; }

        // Người tạo kỳ thi, tối đa 50 ký tự
        public string TeacherCreateName { get; set; }

        // Khóa ngoại liên kết đến môn học (Subject), 1 kỳ thi thuộc 1 môn học
        public string SubjectName { get; set; }

        // Khóa ngoại liên kết đến học kỳ (Semester), 1 kỳ thi thuộc 1 học kỳ
        public string SemesterName { get; set; }
        public int Year { get; set; }
        public int SemesterId { get; set; }
        public int ExamType { get; set; }
    }
    public class PracticeExamResponeDTO
    {
        public int ExamId { get; set; }
        // Tên kỳ thi tự luận, không được để trống, tối đa 100 ký tự
        [Required(ErrorMessage = "Tên kỳ thi không được để trống!")]
        [StringLength(100, ErrorMessage = "Tên kỳ thi không được vượt quá 100 ký tự!")]
        public string PracExamName { get; set; }

        // Ngày tạo kỳ thi, không được để trống
        [Required(ErrorMessage = "Ngày tạo không được để trống!")]
        public DateTime CreateAt { get; set; }

        // Người tạo kỳ thi, tối đa 50 ký tự
        public Guid TeacherId { get; set; }
        public string TeacherName { get; set; }

        // Khóa ngoại liên kết đến môn học (Subject), 1 kỳ thi thuộc 1 môn học
        public int SubjectId { get; set; }
        public string SubjectName { get; set; }

        // Khóa ngoại liên kết đến học kỳ (Semester), 1 kỳ thi thuộc 1 học kỳ
        public int SemesterId { get; set; }
        public string SemesterName { get; set; }
        public ICollection<PracticeExamPaperDTO> PracticeExamPaperDTO { get; set; }

    }
}
