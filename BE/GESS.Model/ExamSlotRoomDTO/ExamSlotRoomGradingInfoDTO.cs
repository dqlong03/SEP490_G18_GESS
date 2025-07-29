using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.ExamSlotRoomDTO
{
    public class ExamSlotRoomGradingInfoDTO
    {
        public int ExamSlotRoomId { get; set; }
        public string ExamName { get; set; }
        public int Duration { get; set; }
        public DateTime StartDay { get; set; }
        public string SlotName { get; set; }
        public string SubjectName { get; set; }
        public List<StudentGradingDTO> Students { get; set; }
    }

    public class StudentGradingDTO
    {
        public Guid PracticeExamHistoryId { get; set; }
        public Guid StudentId { get; set; }
        public string StudentCode { get; set; }
        public string FullName { get; set; }
        public int IsGraded { get; set; }
        public double? Score { get; set; }
    }

}
