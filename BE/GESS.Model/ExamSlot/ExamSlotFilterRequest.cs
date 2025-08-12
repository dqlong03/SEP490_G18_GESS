using GESS.Model.ExamSlotCreateDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.ExamSlot
{
    public class ExamSlotFilterRequest
    {
        public int ? SubjectId { get; set; }
        public int ? SemesterId { get; set; }
        public string? SubjectName { get; set; }
        public int ? Year { get; set; }
        public string? Status { get; set; }
        public string? ExamType { get; set; }
        public DateTime ? FromDate { get; set; }
        public DateTime ? ToDate { get; set; }
    }
    public class ExamSlotResponse
    {
        public int ExamSlotId { get; set; }
        public string SlotName { get; set; }
        public string Status { get; set; }
        public string ExamType { get; set; }
        public int SubjectId { get; set; }
        public string SubjectName { get; set; }
        public int SemesterId { get; set; }
        public string SemesterName { get; set; }

        public DateTime ExamDate { get; set; }
    }
    public class ExamSlotDetail
    {
        public int ExamSlotId { get; set; }
        public string SlotName { get; set; }
        public string Status { get; set; }
        public string ExamType { get; set; }
        public string SubjectName { get; set; }
        public DateTime ExamDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string ? ExamName { get; set; }
        public string SemesterName { get; set; }
        public List<ExamSlotRoomDetail> ExamSlotRoomDetails { get; set; }
    }
}
