using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeExamPaper
{
    public class PracticeExamPaperCreateRequest
    {
        public int ClassId { get; set; }
        public string ExamName { get; set; }
        public int TotalQuestion { get; set; }
        public Guid TeacherId { get; set; }
        public int CategoryExamId { get; set; }
        public List<ManualQuestionDTO> ManualQuestions { get; set; }
        public List<SelectedQuestionDTO> SelectedQuestions { get; set; }
    }

    public class ManualQuestionDTO
    {
        public string Content { get; set; }
        public string Criteria { get; set; }
        public double Score { get; set; }
        public string Level { get; set; }
        public int ChapterId { get; set; }
    }

    public class SelectedQuestionDTO
    {
        public int PracticeQuestionId { get; set; }
        public double Score { get; set; }
    }
}
