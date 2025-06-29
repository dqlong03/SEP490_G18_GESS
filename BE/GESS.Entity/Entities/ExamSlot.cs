using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 13. ExamSlot - Đại diện cho ca thi (VD: Ca 1: 7h-9h)
    public class ExamSlot
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ExamSlotId { get; set; }

        // Tên ca thi, không được để trống, tối đa 50 ký tự
        [Required(ErrorMessage = "Tên ca thi không được để trống!")]
        [StringLength(50, ErrorMessage = "Tên ca thi không được vượt quá 50 ký tự!")]
        public string SlotName { get; set; }
        [Column(TypeName = "time")]
        public TimeSpan StartTime { get; set; }

        [Column(TypeName = "time")]
        public TimeSpan EndTime { get; set; }


        // Danh sách phòng thi cho ca thi này (qua bảng trung gian ExamSlotRoom)
        public ICollection<ExamSlotRoom> ExamSlotRooms { get; set; }

        // Constructor khởi tạo danh sách
        public ExamSlot()
        {
            ExamSlotRooms = new List<ExamSlotRoom>();
        }
    }
}
