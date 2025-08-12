using GESS.Model.MultipleQuestionDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeQuestionDTO
{

    public class EssayQuestionResult
    {
        public string Content { get; set; } = default!;
        public List<BandScoreCriterion> BandScoreGuide { get; set; } = new();
    }

    public class LevelRequest
    {
        public string Difficulty { get; set; } = default!;
        public int NumberOfQuestions { get; set; }
    }

    public class PracQuestionRequest
    {
        public string SubjectName { get; set; } = default!;
        public string MaterialLink { get; set; } = default!;
        public List<LevelRequest> Levels { get; set; } = new();
    }


}
