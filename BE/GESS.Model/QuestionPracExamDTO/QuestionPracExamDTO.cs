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
        public int PracticeQuestionId { get; set; }
        public string QuestionContent { get; set; }
        public string? Answer { get; set; }
        public double ? Score { get; set; }
        public double GradedScore { get; set; }
        public string? GradingCriteria { get; set; }
    }
    public class QuestionPracExamGradeDTO
    {
        public Guid PracExamHistoryId { get; set; }
        public int PracticeQuestionId { get; set; }
        public double GradedScore { get; set; }
    }
    public class QuestionMultiExamDTO
    {
        public Guid MultiExamHistoryId { get; set; }
        public int MultipleQuestionId { get; set; }
        public string QuestionContent { get; set; }

        public string? StudentAnswer { get; set; }

        public List<MultipleAnswerDTO> Answers { get; set; }

        public double? Score { get; set; }
        public double GradedScore { get; set; }
        public int Order { get; set; }
    }
    public class MultipleAnswerDTO
    {
        public int AnswerId { get; set; }       
        public string AnswerContent { get; set; } 
        public bool IsCorrect { get; set; }       
    }
}
