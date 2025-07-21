using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.MultipleExam
{
    public class UpdateMultiExamProgressResponseDTO
    {
        public double TotalScore { get; set; }
        public List<QuestionResultDTO> QuestionResults { get; set; }
    }

    public class QuestionResultDTO
    {
        public int QuestionId { get; set; }
        public bool IsCorrect { get; set; }
        public double Score { get; set; }
    }
}
