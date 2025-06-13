using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 17. ExamService - Đại diện cho nhân viên khảo thí (quản lý kỳ thi)
    public class ExamService
    {
        [Key]
        public Guid ExamServiceId { get; set; }

        // Khóa ngoại liên kết đến người dùng (User), không được để trống
        [Required(ErrorMessage = "UserId không được để trống!")]
        public Guid UserId { get; set; }
        public User User { get; set; }

        // Ngày tuyển dụng nhân viên khảo thí, không được để trống
        [Required(ErrorMessage = "Ngày tuyển dụng không được để trống!")]
        public DateTime HireDate { get; set; }

        // Ngày kết thúc hợp đồng (có thể để trống nếu nhân viên vẫn đang làm việc)
        public DateTime? EndDate { get; set; }
    }

}
