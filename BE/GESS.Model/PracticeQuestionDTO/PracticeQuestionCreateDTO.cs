using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeQuestionDTO
{
    public class PracticeQuestionCreateDTO
    {

        [Required(ErrorMessage = "Nội dung câu hỏi là bắt buộc.")]
        [StringLength(1000, ErrorMessage = "Nội dung không được vượt quá 1000 ký tự.")]
        public string Content { get; set; }

        [StringLength(200, ErrorMessage = "Đường dẫn ảnh không được vượt quá 200 ký tự.")]
        public string? UrlImg { get; set; }

        [Required(ErrorMessage = "Trạng thái hoạt động là bắt buộc.")]
        public bool IsActive { get; set; }

        
        public Guid CreatedBy { get; set; }

        [Required(ErrorMessage = "Trạng thái công khai là bắt buộc.")]
        public bool IsPublic { get; set; }

        [Required(ErrorMessage = "Chương là bắt buộc.")]
        public int ChapterId { get; set; }

        [Required(ErrorMessage = "Danh mục kỳ thi là bắt buộc.")]
        public int CategoryExamId { get; set; }

        [Required(ErrorMessage = "Cấp độ câu hỏi là bắt buộc.")]
        public int LevelQuestionId { get; set; }

        [Required(ErrorMessage = "Học kỳ là bắt buộc.")]
        public int SemesterId { get; set; }
    }
    public class PracticeQuestionCreateNoChapterDTO
    {
        public string Content { get; set; }
        public string? UrlImg { get; set; }
        public bool IsActive { get; set; }
        public Guid CreatedBy { get; set; }
        public bool IsPublic { get; set; }
        public int CategoryExamId { get; set; }
        public int LevelQuestionId { get; set; }
        public int SemesterId { get; set; }
        public string AnswerContent { get; set; }
        public string Criteria { get; set; }
    }

}
