using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 31. NoPEPaperInPE - Bảng trung gian giữa PracticeExamPaper và PracticeExam (liên kết đề thi tự luận với kỳ thi)
    public class NoPEPaperInPE
    {
        // Khóa ngoại liên kết đến kỳ thi tự luận (PracticeExam)
        public int PracExamId { get; set; }
        public PracticeExam PracticeExam { get; set; }

        // Khóa ngoại liên kết đến đề thi tự luận (PracticeExamPaper)
        public int PracExamPaperId { get; set; }
        public PracticeExamPaper PracticeExamPaper { get; set; }
    }

}
