using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.MultipleExam
{
    public class UpdateMultiExamProgressDTO
    {
        public Guid MultiExamHistoryId { get; set; }
        public List<UpdateAnswerDTO> Answers { get; set; }
    }

    public class UpdateAnswerDTO
    {
        public int QuestionId { get; set; }
        public string Answer { get; set; }
    }
}
