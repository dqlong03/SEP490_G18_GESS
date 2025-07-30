using GESS.Model.PracticeExamPaper;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeExam
{
    public class PracticeExamUpdateDTO2
    {
        [Required]
        public int PracExamId { get; set; } // ID of the exam to update

        [Required(ErrorMessage = "Tên kỳ thi không được để trống!")]
        [StringLength(100, ErrorMessage = "Tên kỳ thi không được vượt quá 100 ký tự!")]
        public string PracExamName { get; set; }

        [Required(ErrorMessage = "Thời gian làm bài không được để trống!")]
        public int Duration { get; set; }

        [Required(ErrorMessage = "Ngày thi không được để trống!")]
        public DateTime? StartDay { get; set; }
        public DateTime? EndDay { get; set; }

        [Required(ErrorMessage = "Ngày tạo không được để trống!")]
        public DateTime CreateAt { get; set; }

        public Guid TeacherId { get; set; }
        public int CategoryExamId { get; set; }
        public int SubjectId { get; set; }
        public int ClassId { get; set; }
        public string Status { get; set; }
        public int SemesterId { get; set; }
        public ICollection<PracticeExamPaperDTO> PracticeExamPaperDTO { get; set; }
        public ICollection<Guid> StudentIds { get; set; }
    }
}
