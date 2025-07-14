using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.MultipleQuestionDTO
{
    public class QuestionLevelRequest
    {
        public string Difficulty { get; set; }       
        public int NumberOfQuestions { get; set; }   
    }

    public class QuestionRequest
    {
        public string SubjectName { get; set; }
        public List<QuestionLevelRequest> Levels { get; set; }
        public string Material { get; set; }
    }
}
