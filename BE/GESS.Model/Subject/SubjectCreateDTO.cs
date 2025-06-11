using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Subject
{
    public class SubjectCreateDTO
    {

        // Tên môn học, không được để trống, tối đa 100 ký tự
        [Required(ErrorMessage = "Tên môn học không được để trống!")]
        [StringLength(100, ErrorMessage = "Tên môn học không được vượt quá 100 ký tự!")]
        public string SubjectName { get; set; }

        // Mô tả môn học, tối đa 500 ký tự
        [StringLength(500, ErrorMessage = "Mô tả không được vượt quá 500 ký tự!")]
        public string Description { get; set; }

        // Khóa học của môn (VD: "CS101"), tối đa 20 ký tự
        [StringLength(20, ErrorMessage = "Khóa học không được vượt quá 20 ký tự!")]
        public string Course { get; set; }
        // Tổng số tín chỉ của môn học, không được để trống
        [Required(ErrorMessage = "Tổng số tín chỉ không được để trống!")]
        public int NoCredits { get; set; }
    }
}
