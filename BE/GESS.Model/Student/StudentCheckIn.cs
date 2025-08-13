using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Student
{
    public class StudentCheckIn
    {
        public Guid Id { get; set; }
        public string Code { get; set; }
        public string FullName { get; set; }
        public string AvatarURL { get; set; }
        public int IsCheckedIn { get; set; } // 1: đã điểm danh, 0: chưa điểm danh
        public string? StatusExamHistory { get; set; } // Trạng thái bài thi của học sinh trong lịch sử thi
    }
}
