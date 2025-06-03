using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 36. ApplyTrainingProgram - Bảng trung gian giữa TrainingProgram và Cohort (liên kết chương trình đào tạo với niên khóa)
    public class ApplyTrainingProgram
    {
        // Khóa ngoại liên kết đến chương trình đào tạo (TrainingProgram)
        public int TrainProId { get; set; }
        public TrainingProgram TrainingProgram { get; set; }

        // Khóa ngoại liên kết đến niên khóa (Cohort)
        public int CohortId { get; set; }
        public Cohort Cohort { get; set; }
    }
}
