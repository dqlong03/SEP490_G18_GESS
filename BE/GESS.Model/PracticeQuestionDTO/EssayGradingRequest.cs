using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeQuestionDTO
{

    public class EssayGradingRequest
    {
        public string MaterialLink { get; set; } = default!;
        public string QuestionContent { get; set; } = default!;
        public string AnswerContent { get; set; } = default!;
        public List<BandScoreCriterion> BandScoreGuide { get; set; } = new();
        public double MaxScore { get; set; } // Tổng điểm tối đa mong muốn
    }

    public class BandScoreCriterion
    {
        public string CriterionName { get; set; } = default!;
        public double WeightPercent { get; set; } // % trọng số trên tổng (ví dụ: 40 nghĩa là 40%)
        public string? Description { get; set; }
    }

    public class CriterionScore
    {
        public string CriterionName { get; set; } = default!;
        public double AchievementPercent { get; set; } // 0..100, mức độ đạt được theo tiêu chí
        public double WeightedScore { get; set; } // đóng góp thực tế vào tổng (tính từ AchievementPercent * WeightPercent)
        public string Explanation { get; set; } = default!;
    }


    public class EssayGradingResult
    {
        public List<CriterionScore> CriterionScores { get; set; } = new();
        public double TotalScore { get; set; }
        public string OverallExplanation { get; set; } = string.Empty;

    }

}
