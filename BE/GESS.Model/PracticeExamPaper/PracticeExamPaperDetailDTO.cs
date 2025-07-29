using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeExamPaper
{
    public class PracticeExamPaperDetailDTO
    {
        public int PracExamPaperId { get; set; }
        public string PracExamPaperName { get; set; }
        public DateTime CreateAt { get; set; }
        public string SubjectName { get; set; }
        public string SemesterName { get; set; }
        public string CategoryExamName { get; set; }
        public string Status { get; set; }

        public List<LPracticeExamQuestionDetailDTO> Questions { get; set; } = new();
    }

    public class LPracticeExamQuestionDetailDTO
    {
        public int QuestionOrder { get; set; }
        public string Content { get; set; }
        public string? AnswerContent { get; set; }
        public double Score { get; set; }
    }
}
