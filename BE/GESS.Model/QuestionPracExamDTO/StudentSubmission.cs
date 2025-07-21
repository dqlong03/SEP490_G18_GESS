using GESS.Entity.Entities;
using GESS.Model.QuestionPracExam;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeTestQuestions
{
    public class StudentSubmission
    {
        public Guid PracExamHistoryId { get; set; }
        public Guid StudentId { get; set; }
        public string StudentCode { get; set; }
        public string FullName { get; set; }
        public ICollection<QuestionPracExamDTO> QuestionPracExamDTO { get; set; }

    }
    public class StudentSubmissionMultiExam
    {
        public Guid MultiExamHistoryId { get; set; }
        public Guid StudentId { get; set; }
        public string StudentCode { get; set; }
        public string FullName { get; set; }
        public ICollection<QuestionMultiExamDTO> QuestionMultiExamDTO { get; set; }

    }
}
