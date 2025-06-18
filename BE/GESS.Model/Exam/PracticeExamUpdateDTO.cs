using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Exam
{
    public class PracticeExamUpdateDTO
    {
        public int PracExamId { get; set; }
        public string PracExamName { get; set; }
        public int Duration { get; set; }
        public DateTime CreateAt { get; set; }
        public int CategoryExamId { get; set; }
        public int SubjectId { get; set; }
        public int SemesterId { get; set; }

        ////
    }
}
