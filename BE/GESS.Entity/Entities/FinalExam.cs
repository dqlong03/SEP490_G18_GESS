using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 25. FinalExam - Bảng trung gian giữa MultiExam và MultiQuestion (liên kết kỳ thi trắc nghiệm với câu hỏi)
    public class FinalExam
    {
        // Khóa ngoại liên kết đến kỳ thi trắc nghiệm (MultiExam)
        public int MultiExamId { get; set; }
        public MultiExam MultiExam { get; set; }

        // Khóa ngoại liên kết đến câu hỏi trắc nghiệm (MultiQuestion)
        public int MultiQuestionId { get; set; }
        public MultiQuestion MultiQuestion { get; set; }
    }

}
