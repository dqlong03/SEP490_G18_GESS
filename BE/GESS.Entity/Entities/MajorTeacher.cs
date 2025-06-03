using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 20. MajorTeacher - Bảng trung gian giữa Major và Teacher (liên kết ngành học với giáo viên)
    public class MajorTeacher
    {
        // Khóa ngoại liên kết đến ngành học (Major)
        public int MajorId { get; set; }
        public Major Major { get; set; }

        // Khóa ngoại liên kết đến giáo viên (Teacher)
        public Guid TeacherId { get; set; }
        public Teacher Teacher { get; set; }
    }

}
