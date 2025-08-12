using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.MultipleQuestionDTO
{
    public enum QuestionType
    {
        MultipleChoice,
        SelectOne,
        TrueFalse
    }

    public class QuestionSpecification
    {
        public string Difficulty { get; set; } = default!;
        public QuestionType Type { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Số lượng câu hỏi phải lớn hơn 0!")]
        public int NumberOfQuestions { get; set; }
    }

    public class QuestionRequest
    {
        public string SubjectName { get; set; } = default!;
        public string MaterialLink { get; set; } = default!;
        public List<QuestionSpecification> Specifications { get; set; } = new();
    }

    public class GeneratedQuestion
    {
        public string Content { get; set; } = default!;
        public QuestionType Type { get; set; }
        public List<GeneratedAnswer> Answers { get; set; } = new();
    }

    public class GeneratedAnswer
    {
        public string Text { get; set; } = default!;
        public bool IsTrue { get; set; }
    }


}
