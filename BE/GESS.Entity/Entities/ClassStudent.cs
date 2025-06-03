using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 18. ClassStudent - Bảng trung gian giữa Class và Student (liên kết lớp học với sinh viên)
    public class ClassStudent
    {
        // Khóa ngoại liên kết đến lớp học (Class)
        public int ClassId { get; set; }
        public Class Class { get; set; }

        // Khóa ngoại liên kết đến sinh viên (Student)
        public Guid StudentId { get; set; }
        public Student Student { get; set; }
    }
}
