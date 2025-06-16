using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 11. Teacher - Đại diện cho giáo viên
    public class Teacher
    {
        // Khóa chính, tự động tăng
        [Key]
        public Guid TeacherId { get; set; }

        // Khóa ngoại liên kết đến người dùng (User), không được để trống
        [Required(ErrorMessage = "UserId không được để trống!")]
        public Guid UserId { get; set; }
        public User User { get; set; }

        // Ngày tuyển dụng giáo viên, không được để trống
        [Required(ErrorMessage = "Ngày tuyển dụng không được để trống!")]
        public DateTime HireDate { get; set; }

        // Ngày kết thúc hợp đồng (có thể để trống nếu giáo viên vẫn đang làm việc)
        public DateTime? EndDate { get; set; }

        // Danh sách ngành mà giáo viên thuộc về (qua bảng trung gian MajorTeacher)
        //public ICollection<MajorTeacher> MajorTeachers { get; set; }

        // Danh sách lớp học mà giáo viên dạy (qua bảng trung gian Class)
        public ICollection<Class> Classes { get; set; }

        // Phòng thi và ca thi mà giáo viên này trông thi (1 giáo viên trông 1 phòng/ca)
        public ExamSlotRoom ExamSlotRoomSupervisor { get; set; }

        // Phòng thi và ca thi mà giáo viên này chấm điểm (1 giáo viên chấm 1 phòng/ca)
        public ExamSlotRoom ExamSlotRoomGrader { get; set; }

        public Major Major { get; set; }
        public int MajorId { get; set; }

        // Constructor khởi tạo các danh sách
        public Teacher()
        {
            //MajorTeachers = new List<MajorTeacher>();
            Classes = new List<Class>();
        }
    }
}
