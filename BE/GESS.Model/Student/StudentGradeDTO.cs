using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Student
{
    public class StudentGradeDTO
    {
        public Guid Id { get; set; }
        public string Code { get; set; }
        public string FullName { get; set; }
        public string AvatarURL { get; set; }
        public int IsGraded { get; set; } // 1: đã chấm điểm, 0: chưa chấm điểm
        public double? Grade { get; set; } // Điểm của sinh viên, có thể null nếu chưa chấm điểm
    }
}
