using GESS.Model.Student;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace GESS.Model.ExamSlotCreateDTO
{
    public class GeneratedExamSlot
    {
        public int SubjectId { get; set; }
        public string Status { get; set; }
        public string MultiOrPractice { get; set; }
        public string SlotName { get; set; }
        public int SemesterId { get; set; }
        public DateTime Date { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public List<RoomExamSlot> Rooms { get; set; }
    }

    public class RoomExamSlot
    {
        public int RoomId { get; set; }
        public List<StudentAddDto> Students { get; set; }
    }
    public class ExamSlotRoomDetail
    {
        public int ExamSlotRoomId { get; set; }
        public int RoomId { get; set; }
        public string RoomName { get; set; }
        public string GradeTeacherName { get; set; }
        public string ProctorName { get; set; }
        public int Status { get; set; }
        public string ExamType { get; set; }
        public DateTime ExamDate { get; set; }
        public string? ExamName { get; set; }
        public string SubjectName { get; set; }
        public string SemesterName { get; set; }
        public List<StudentAddDto> Students { get; set; }
    }
    public class ExamSlotCheck
    {
        public int ExamSlotId { get; set; }
        public List<TeacherCheck> TeacherChecks { get; set; }
    }
    public class TeacherCheck
    {
        public Guid TeacherId { get; set; }
        public string TeacherName { get; set; }
        public bool IsChecked { get; set; }
    }
}
