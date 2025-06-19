using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Chapter
{
    public class ChapterUpdateDTO
    {
        [Required(ErrorMessage = "Tên chương là bắt buộc.")]
        [StringLength(100)]
        public string ChapterName { get; set; }

        [StringLength(500)]
        public string Description { get; set; }
        // ThaiNH_add_UpdateMark&UserProfile_Begin
        public string Curriculum { get; set; }
        // ThaiNH_add_UpdateMark&UserProfile_End

        [Required]
        public int SubjectId { get; set; }
    }
}
