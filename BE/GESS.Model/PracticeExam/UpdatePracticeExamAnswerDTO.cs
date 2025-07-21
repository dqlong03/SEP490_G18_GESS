using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeExam
{
    public class UpdatePracticeExamAnswerDTO
    {
        public Guid PracExamHistoryId { get; set; }
        public int PracticeQuestionId { get; set; }
        public string Answer { get; set; }
    }

    public class UpdatePracticeExamAnswersRequest
    {
        public List<UpdatePracticeExamAnswerDTO> Answers { get; set; }
    }
}
