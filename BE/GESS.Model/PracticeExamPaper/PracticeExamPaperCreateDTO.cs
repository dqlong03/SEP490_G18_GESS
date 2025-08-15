using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeExamPaper
{
    public class PracticeExamPaperCreateRequest
    {
        [Required(ErrorMessage = "ClassId không được để trống")]
        [Range(1, int.MaxValue, ErrorMessage = "ClassId phải lớn hơn 0")]
        public int ClassId { get; set; }

        [Required(ErrorMessage = "Tên đề thi không được để trống")]
        [StringLength(100, ErrorMessage = "Tên đề thi không được vượt quá 100 ký tự")]
        public string ExamName { get; set; }

        [Required(ErrorMessage = "Số lượng câu hỏi không được để trống")]
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng câu hỏi phải lớn hơn 0")]
        public int TotalQuestion { get; set; }

        [Required(ErrorMessage = "TeacherId không được để trống")]
        public Guid TeacherId { get; set; }

        [Required(ErrorMessage = "CategoryExamId không được để trống")]
        [Range(1, int.MaxValue, ErrorMessage = "CategoryExamId phải lớn hơn 0")]
        public int CategoryExamId { get; set; }

        public int SemesterId { get; set; }

        public List<ManualQuestionDTO> ManualQuestions { get; set; }
        public List<SelectedQuestionDTO> SelectedQuestions { get; set; }
    }
    public class FinalPracticeExamPaperCreateRequest
    {
        public string ExamName { get; set; }
        public int TotalQuestion { get; set; }
        public Guid TeacherId { get; set; }
        public int SemesterId { get; set; }
        public int SubjectId { get; set; }
        public List<ManualQuestionDTO> ManualQuestions { get; set; }
        public List<SelectedQuestionDTO> SelectedQuestions { get; set; }
    }
    public class ManualQuestionDTO
    {
        [Required(ErrorMessage = "Nội dung câu hỏi không được để trống")]
        [StringLength(500, ErrorMessage = "Nội dung câu hỏi không được vượt quá 500 ký tự")]
        public string Content { get; set; }

        [Required(ErrorMessage = "Tiêu chí chấm điểm không được để trống")]
        [StringLength(1000, ErrorMessage = "Tiêu chí chấm điểm không được vượt quá 1000 ký tự")]
        public string Criteria { get; set; }

        [Required(ErrorMessage = "Điểm số không được để trống")]
        [Range(0.1, double.MaxValue, ErrorMessage = "Điểm số phải lớn hơn 0")]
        public double Score { get; set; }

        [Required(ErrorMessage = "Mức độ không được để trống")]
        public string Level { get; set; }

        [Required(ErrorMessage = "ChapterId không được để trống")]
        [Range(1, int.MaxValue, ErrorMessage = "ChapterId phải lớn hơn 0")]
        public int ChapterId { get; set; }
    }

    public class SelectedQuestionDTO
    {
        [Required(ErrorMessage = "PracticeQuestionId không được để trống")]
        [Range(1, int.MaxValue, ErrorMessage = "PracticeQuestionId phải lớn hơn 0")]
        public int PracticeQuestionId { get; set; }

        [Required(ErrorMessage = "Điểm số không được để trống")]
        [Range(0.1, double.MaxValue, ErrorMessage = "Điểm số phải lớn hơn 0")]
        public double Score { get; set; }
    }

    public class PracticeExamPaperCreateResponse
    {
        public int PracExamPaperId { get; set; }
        public string Message { get; set; }
    }
}
