using GESS.Model.NoQuestionInChapter;
using GESS.Model.Student;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.MultipleExam
{
    public class MultipleExamUpdateDTO
    {
        [Required]
        public int MultiExamId { get; set; }
        [Required]
        [StringLength(100)]
        public string MultiExamName { get; set; }
        [Required]
        public int NumberQuestion { get; set; }
        [Required]
        public int Duration { get; set; }
        [Required]
        public DateTime StartDay { get; set; }
        public DateTime EndDay { get; set; }
        [Required]
        public DateTime CreateAt { get; set; }
        public Guid TeacherId { get; set; }
        public int SubjectId { get; set; }
        public int ClassId { get; set; }
        public int CategoryExamId { get; set; }
        public int SemesterId { get; set; }
        public bool IsPublish { get; set; }
        public ICollection<NoQuestionInChapterDTO> NoQuestionInChapterDTO { get; set; }
        public ICollection<StudentExamDTO> StudentExamDTO { get; set; }
    }

}
