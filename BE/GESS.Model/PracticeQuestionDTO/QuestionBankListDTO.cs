using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeQuestionDTO
{
    public class QuestionBankListDTO
    {
        public int QuestionId { get; set; }
        public string Content { get; set; }
        public string QuestionType { get; set; } // "Trắc nghiệm" hoặc "Tự luận"
        public string Level { get; set; }
        public string Chapter { get; set; }
        public bool IsPublic { get; set; }
        public List<AnswerDTO> Answers { get; set; }
    }

    public class AnswerDTO
    {
        public int AnswerId { get; set; }
        public string Content { get; set; }
        public bool IsCorrect { get; set; }
    }
}
