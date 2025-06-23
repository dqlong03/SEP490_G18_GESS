using GESS.Entity.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Exam
{
    public class ExamListOfStudentResponse
    {
        public int ExamId { get; set; }
        public string ExamName { get; set; }
        public string SubjectName { get; set; }
        public int Duration { get; set; }
        public string? Status { get; set; }
        public string? CodeStart { get; set; }
        public string? RoomName { get; set; }
        public DateTime ExamSlotName { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public ExamSlotRoom? ExamSlotRoom { get; set; }
    }
}
