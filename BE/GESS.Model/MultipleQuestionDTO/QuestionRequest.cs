using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.MultipleQuestionDTO
{
    public class QuestionRequest
    {
        public string SubjectName { get; set; }
        public string MaterialLink { get; set; }
        public List<QuestionLevel> Levels { get; set; }
    }

    public class QuestionLevel
    {
        public string Difficulty { get; set; }
        public int NumberOfQuestions { get; set; }
    }
    public class GeneratedQuestion
    {
        public string Content { get; set; }
        public List<GeneratedAnswer> Answers { get; set; }
    }

    public class GeneratedAnswer
    {
        public string Text { get; set; }
        public bool IsTrue { get; set; }
    }

}
