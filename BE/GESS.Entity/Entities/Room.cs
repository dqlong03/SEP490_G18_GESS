using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 12. Room - Đại diện cho phòng học/phòng thi (VD: Phòng A101)
    public class Room
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RoomId { get; set; }

        // Tên phòng, không được để trống, tối đa 50 ký tự
        [Required(ErrorMessage = "Tên phòng không được để trống!")]
        [StringLength(50, ErrorMessage = "Tên phòng không được vượt quá 50 ký tự!")]
        public string RoomName { get; set; }

        // Mô tả phòng, tối đa 200 ký tự
        [StringLength(200, ErrorMessage = "Mô tả không được vượt quá 200 ký tự!")]
        public string Description { get; set; }

        // Trạng thái phòng (VD: "Available", "Occupied"), tối đa 20 ký tự
        [StringLength(20, ErrorMessage = "Trạng thái không được vượt quá 20 ký tự!")]
        public string Status { get; set; }

        // Sức chứa của phòng, không được để trống
        [Required(ErrorMessage = "Sức chứa không được để trống!")]
        public int Capacity { get; set; }

        // Danh sách ca thi diễn ra ở phòng này (qua bảng trung gian ExamSlotRoom)
        public ICollection<ExamSlotRoom> ExamSlotRooms { get; set; }

        // Constructor khởi tạo danh sách
        public Room()
        {
            ExamSlotRooms = new List<ExamSlotRoom>();
        }
    }
}
