using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.GradeSchedule
{
    public class ExamNeedGrade
    {
        public int ExamSlotRoomId { get; set; }
        public int ExamId { get; set; }
        public string? ExamName  { get; set; }
        public string? SubjectName { get; set; }
        public int SemesterId { get; set; }
        public int? IsGrade { get; set; }
        public DateTime? ExamDate { get; set; }
    }
    public class ExamNeedGradeMidTerm
    {
        public int ExamSlotRoomId { get; set; }
        public int ExamId { get; set; }
        public string? ExamName { get; set; }
        public string? SubjectName { get; set; }
        public int SemesterId { get; set; }
        public int? IsGrade { get; set; }
        public DateTime? ExamDate { get; set; }
        public int? ExamType { get; set; } = 1;
        public int ClassId { get; set; }
    }
}
