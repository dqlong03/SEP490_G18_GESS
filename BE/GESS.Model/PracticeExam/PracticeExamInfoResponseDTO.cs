using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeExam
{
    public class PracticeExamInfoResponseDTO
    {
        public Guid PracExamHistoryId { get; set; }
        public string StudentFullName { get; set; }
        public string StudentCode { get; set; }
        public string SubjectName { get; set; }
        public string ExamCategoryName { get; set; }
        public int Duration { get; set; }
        public DateTime? StartTime { get; set; } // Để frontend tính thời gian còn lại
        public string Message { get; set; }
        public List<PracticeExamQuestionDetailDTO> Questions { get; set; }
    }

    public class PracticeExamQuestionDetailDTO
    {
        public int QuestionOrder { get; set; }
        public string Content { get; set; }
        public string? AnswerContent { get; set; }
        public double Score { get; set; }
    }
}
