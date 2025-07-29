using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 20. SubjectTeacher - Bảng trung gian giữa Subject và Teacher (liên kết mon học với giáo viên)
    public class SubjectTeacher
    {
        // Khóa ngoại liên kết đến ngành học (Major)
        public int SubjectId { get; set; }
        public Subject? Subject { get; set; }

        // Khóa ngoại liên kết đến giáo viên (Teacher)
        public Guid? TeacherId { get; set; }
        public Teacher? Teacher { get; set; }
        public bool IsGradeTeacher { get; set; } = false; // Xác định xem giáo viên có phải là giáo viên chấm điểm không
        public bool IsCreateExamTeacher { get; set; } = false; // Xác định xem giáo viên có phải là giáo viên tạo đề thi không
        public bool IsActiveSubjectTeacher { get; set; } = true;

    }

}
