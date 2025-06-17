using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Class
{
    public class ClassUpdateDTO
    {
       

        [Required(ErrorMessage = "Giáo viên không được để trống!")]
        public Guid TeacherId { get; set; }

        [Required(ErrorMessage = "Môn học không được để trống!")]
        public int SubjectId { get; set; }

        [Required(ErrorMessage = "Học kỳ không được để trống!")]
        public int SemesterId { get; set; }

        [Required(ErrorMessage = "Tên lớp học không được để trống!")]
        [StringLength(50, ErrorMessage = "Tên lớp học không được vượt quá 50 ký tự!")]
        public string ClassName { get; set; }

        
    }
}
