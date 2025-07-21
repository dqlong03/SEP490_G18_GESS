using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Exam
{
    public class MultiExamUpdateDTO
    {
        public int MultiExamId { get; set; }
        public string MultiExamName { get; set; }
        public int NumberQuestion { get; set; }
        public int Duration { get; set; }
        public DateTime CreateAt { get; set; }
        public int CategoryExamId { get; set; }
        public int SubjectId { get; set; }
        public int SemesterId { get; set; }
    }
}
