using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.TrainingProgram
{
    public class TrainingProgramDTO
    {
        public int TrainingProgramId { get; set; }
        public string TrainProName { get; set; }

        // Ngày bắt đầu chương trình, không được để trống
        [Required(ErrorMessage = "Ngày bắt đầu không được để trống!")]
        public DateTime StartDate { get; set; }

        // Ngày kết thúc chương trình, không được để trống
        [Required(ErrorMessage = "Ngày kết thúc không được để trống!")]
        public DateTime EndDate { get; set; }
        // Tổng số tín chỉ của chương trình, không được để trống
        [Required(ErrorMessage = "Tổng số tín chỉ không được để trống!")]
        public int NoCredits { get; set; }
    }
}
