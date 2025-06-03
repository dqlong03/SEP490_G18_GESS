using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 3. SubjectTrainingProgram - Bảng trung gian giữa Subject và TrainingProgram (liên kết môn học với chương trình đào tạo)
    public class SubjectTrainingProgram
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SubTrainProgramId { get; set; }

        // Khóa ngoại liên kết đến môn học (Subject)
        public int SubjectId { get; set; }
        public Subject Subject { get; set; }

        // Khóa ngoại liên kết đến chương trình đào tạo (TrainingProgram)
        public int TrainProId { get; set; }
        public TrainingProgram TrainingProgram { get; set; }

        // Danh sách các môn tiền điều kiện (qua bảng trung gian PreconditionSubject)
        public ICollection<PreconditionSubject> PreconditionSubjects { get; set; }

        // Constructor khởi tạo danh sách
        public SubjectTrainingProgram()
        {
            PreconditionSubjects = new List<PreconditionSubject>();
        }
    }
}
