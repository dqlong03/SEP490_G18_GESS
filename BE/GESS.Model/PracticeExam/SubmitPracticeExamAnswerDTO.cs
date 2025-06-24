using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeExam
{
    public class SubmitPracticeExamAnswerDTO
    {
        public int PracticeQuestionId { get; set; }
        public string Answer { get; set; }
    }
    public class SubmitPracticeExamRequest
    {
        public Guid PracExamHistoryId { get; set; }
        public List<SubmitPracticeExamAnswerDTO> Answers { get; set; }
    }
}
