using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.CheckDup
{
    public class InputQuestion
    {
        public int QuestionID { get; set; }
        public string Content { get; set; } = string.Empty;
    }

    public class DuplicateGroup
    {
        public double SimilarityScore { get; set; } // trung bình nhóm
        public List<InputQuestion> Questions { get; set; } = new();
    }

    public class FindDuplicatesRequest
    {
        public List<InputQuestion> Questions { get; set; } = new();
        /// <summary>
        /// Ngưỡng tương đồng tối thiểu từ 0..1 để nhóm (mặc định 0.75)
        /// </summary>
        public double SimilarityThreshold { get; set; } = 0.75;
    }
}
