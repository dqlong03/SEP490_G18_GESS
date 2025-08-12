using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.ExamSlot
{
    public class ExamSlotDTO
    {
        public int ExamSlotId { get; set; }

        // Tên ca thi, không được để trống, tối đa 50 ký tự
        [Required(ErrorMessage = "Tên ca thi không được để trống!")]
        [StringLength(50, ErrorMessage = "Tên ca thi không được vượt quá 50 ký tự!")]
        public string SlotName { get; set; }

        // Thời gian bắt đầu ca thi, không được để trống
        [Required(ErrorMessage = "Thời gian bắt đầu không được để trống!")]
        public TimeSpan StartTime { get; set; }

        // Thời gian kết thúc ca thi, không được để trống
        [Required(ErrorMessage = "Thời gian kết thúc không được để trống!")]
        public TimeSpan EndTime { get; set; }

        // Danh sách phòng thi cho ca thi này (qua bảng trung gian ExamSlotRoom)
    }
    public class ExamDTO
    {
        public int ExamId { get; set; }       
        public string ExamName { get; set; }
        public string ExamType { get; set; }
    }
    
}
