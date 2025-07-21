using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.ExamSlotRoomDTO
{
    public class ExamSlotRoomDetail
    {
        public int ExamSlotRoomId { get; set; }
        public string SlotName { get; set; }
        public string RoomName { get; set; }
        public string? SubjectName { get; set; }
        public DateTime ExamDate { get; set; }
        public string ? ExamName { get; set; }
        public TimeSpan ? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        public string? Code { get; set; }
    }
}
