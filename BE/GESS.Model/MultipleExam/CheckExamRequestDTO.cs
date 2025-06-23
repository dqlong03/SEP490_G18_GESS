using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.MultipleExam
{
    public class CheckExamRequestDTO
    {
        [Required]
        public int  ExamId { get; set; }
        [Required]
        public string Code { get; set; }
        [Required]
        public Guid StudentId { get; set; }
    }
}
