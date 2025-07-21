using GESS.Entity.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeExamPaper
{
    public class PracticeExamPaperCreate
    {
        public string PracExamPaperName { get; set; }
        public DateTime CreateAt { get; set; }
        public string Status { get; set; }
        public int CategoryExamId { get; set; }
        public int SubjectId { get; set; }
        public int SemesterId { get; set; }

        public List<QuestionScoreMapping> QuestionScores { get; set; }
    }
    public class QuestionScoreMapping
    {
        
        public int PracticeQuestionId { get; set; }
        public double Score { get; set; }
    }
}
