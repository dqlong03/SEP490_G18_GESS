using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeQuestionDTO
{
    public class EssayGradingRequest
    {
        public string QuestionContent { get; set; }
        public string AnswerContent { get; set; }
        public string BandScoreGuide { get; set; }
        public string MaterialLink { get; set; }
        public double MaxScore { get; set; }
    }
    public class EssayGradingResult
    {
        public double Score { get; set; }
        public string Explanation { get; set; }
    }
}
