using GESS.Model.MultipleQuestionDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeQuestionDTO
{
    public class PracQuestionRequest
    {
        public string SubjectName { get; set; }
        public string MaterialLink { get; set; }
        public List<QuestionLevel> Levels { get; set; }
    }

    public class EssayQuestionResult
    {
        public string Content { get; set; }
        public string BandScoreGuide { get; set; }
    }

}
