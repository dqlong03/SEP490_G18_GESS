using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Major
{
    public class MajorCreateDTO
    {
        // Tên ngành, không được để trống, tối đa 100 ký tự(NVARCHAR(100) NOT NULL trong SQL)
        [Required(ErrorMessage = "Tên ngành không được để trống!")]
        [StringLength(1000, ErrorMessage = "Tên ngành không được vượt quá 1000 ký tự!")]
        public string MajorName { get; set; }

        // Ngày bắt đầu ngành, không được để trống (DATE NOT NULL trong SQL)
        [Required(ErrorMessage = "Ngày bắt đầu không được để trống!")]
        public DateTime StartDate { get; set; }
    }
}
