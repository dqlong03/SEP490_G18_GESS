using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
// ThaiNH_Create_ManageSemester&ManageRoom

namespace GESS.Model.SemestersDTO
{
    public class SemesterCreateDTO
    {
        [Required(ErrorMessage = "Tên học kỳ không được để trống")]
        public List<string> SemesterNames { get; set; } = new();
    }
}
