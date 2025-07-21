using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeExam
{
    public class PracticeAnswerOfQuestionDTO
    {
        public int AnswerId { get; set; }
        public string QuestionName { get; set; }
        public string AnswerContent { get; set; }
    }
}
