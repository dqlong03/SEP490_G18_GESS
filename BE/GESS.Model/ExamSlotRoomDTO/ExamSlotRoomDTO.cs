using GESS.Entity.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.ExamSlotRoomDTO
{
    public class ExamSlotRoomDTO
    {
        public int ExamSlotRoomId { get; set; }
        public int ExamSlotId { get; set; }
        public string RoomName { get; set; }
        public string? SubjectName { get; set; }
        public DateTime ExamDate { get; set; }

        public DateTime? StartDay { get; set; }   // Thêm dòng này
        public DateTime? EndDay { get; set; }
        public int? Status { get; set; } 
    }
}
