using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeExam
{
    public class CheckPracticeExamRequestDTO
    {
        public int ExamId { get; set; }
        public string Code { get; set; }
        public Guid StudentId { get; set; }
    }
}
