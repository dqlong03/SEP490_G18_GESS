using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 4. PreconditionSubject - Bảng trung gian giữa SubjectTrainingProgram và Subject (liên kết môn tiền điều kiện)
    public class PreconditionSubject
    {
        // Khóa ngoại liên kết đến SubjectTrainingProgram
        public int SubTrainingProgramId { get; set; }
        public SubjectTrainingProgram SubjectTrainingProgram { get; set; }

        // Khóa ngoại liên kết đến môn học tiền điều kiện (Subject)
        public int PreconditionSubjectId { get; set; }
        public Subject PreSubject { get; set; }
    }
}
