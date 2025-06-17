using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.MultiExamHistories
{
    public class MultiExamHistoryCreateDTO
    {
        // Khóa ngoại liên kết đến kỳ thi trắc nghiệm (MultiExam)
        public int MultiExamId { get; set; }
        // Khóa ngoại liên kết đến sinh viên (Student)
        public Guid StudentId { get; set; }
    }
}
