using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeExamPaper
{
    public class PracticeExamPaperDTO
    {
        public int PracExamPaperId { get; set; }
        public string PracExamPaperName { get; set; }
        public string Year { get; set; }
        public string Semester { get; set; }
    }
    public class FinalPracticeExamPaperDTO
    {
        public int PracExamPaperId { get; set; }
    }
}
