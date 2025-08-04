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
        public List<TeacherAssignment> Proctors { get; set; }
        public List<GraderAssignment> Graders { get; set; }
    }

    public class RoomExamSlot
    {
        public int RoomId { get; set; }
        public List<StudentAddDto> Students { get; set; }
    }

    public class TeacherAssignment
    {
        public Guid ?TeacherId { get; set; }
        public string FullName { get; set; }
    }
    public class GraderAssignment
    {
        public int RoomId { get; set; }
        public Guid ?TeacherId { get; set; }
        public string FullName { get; set; }
    }
}
