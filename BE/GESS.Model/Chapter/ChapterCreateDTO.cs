using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Chapter
{
    public class ChapterCreateDTO
    {
        [Required(ErrorMessage = "Tên chương là bắt buộc.")]
        [StringLength(100, ErrorMessage = "Tên chương không được vượt quá 100 ký tự.")]
        public string ChapterName { get; set; }

        [StringLength(500, ErrorMessage = "Mô tả không được vượt quá 500 ký tự.")]
        public string Description { get; set; }

        // ThaiNH_add_updateMark&UserProfile_Begin
        //public IFormFile Curriculum { get; set; }
        // ThaiNH_add_updateMark&UserProfile_End

      
    }
}
