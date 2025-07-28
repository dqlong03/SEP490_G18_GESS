using GESS.Model.Student;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.MultiExamHistories
{
    public class MultipleExamDetail
    {
        public int MultiExamId { get; set; }
        public string ExamName { get; set; }
        public string SubjectName { get; set; }
        public int Duration { get; set; }
        public string Status { get; set; }
        public string Category { get; set; }
        public string Code { get; set; }
        public List<StudentCheckIn> Students { get; set; }
    }
    public class PraticeExamDetail
    {
        public int PracExamId { get; set; }
        public string ExamName { get; set; }
        public string SubjectName { get; set; }
        public int Duration { get; set; }
        public string Status { get; set; }
        public string Category { get; set; }
        public string Code { get; set; }
        public List<StudentCheckIn> Students { get; set; }
    }
}
