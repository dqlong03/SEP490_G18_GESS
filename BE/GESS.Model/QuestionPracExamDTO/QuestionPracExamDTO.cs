using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.QuestionPracExam
{
    public class QuestionPracExamDTO
    {
        public Guid PracExamHistoryId { get; set; }
        public string QuestionContent { get; set; }
        public string? Answer { get; set; }
        public double ? Score { get; set; }
        public string? GradingCriteria { get; set; }
    }
}
