using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Exam
{
    public class ExamListResponse
    {
        public int ExamId { get; set; }
        public string SemesterName { get; set; }
        public string ExamName { get; set; }
        public string ExamType { get; set; }
       // public string GradeComponent { get; set; } 
        public string StatusExam { get; set; } 
        public DateTime CreateDate { get; set; }
    }
}
