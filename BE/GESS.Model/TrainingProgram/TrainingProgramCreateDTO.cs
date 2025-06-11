using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.TrainingProgram
{
    public class TrainingProgramCreateDTO
    {
        public string TrainProName { get; set; }

        // Ngày bắt đầu chương trình, không được để trống
        [Required(ErrorMessage = "Ngày bắt đầu không được để trống!")]
        public DateTime StartDate { get; set; }
        // Tổng số tín chỉ của chương trình, không được để trống
        [Required(ErrorMessage = "Tổng số tín chỉ không được để trống!")]
        public int NoCredits { get; set; }
        // Khóa ngoại liên kết đến ngành (Major), 1 chương trình đào tạo thuộc 1 ngành
    }
}
