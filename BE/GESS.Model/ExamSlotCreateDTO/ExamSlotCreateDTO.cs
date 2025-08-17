using GESS.Model.RoomDTO;
using GESS.Model.Student;
using GESS.Model.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.ExamSlotCreateDTO
{
    public class ExamSlotCreateDTO
    {
        public string slotName { get; set; }
        public int subjectId { get; set; }  
        public int semesterId { get; set; }
        public List<StudentAddDto> students { get; set; }
        public List<RoomListDTO> rooms { get; set; }
        public DateTime StartDate { get; set; }
        public int Duration { get; set; }
        public int ExamType { get; set; } 
        public DateTime StartTimeInDay { get; set; }
        public DateTime EndTimeInDay { get; set; }
        public int RelaxationTime { get; set; } 
        public bool OptimizedByRoom { get; set; } = false;
        public bool OptimizedBySlotExam { get; set; } = true;

    }
    public class TeacherExamSlotRoom
    {
        public int examSlotRoomId { get; set; }
        public Guid TeacherId { get; set; }
        public string TeacherName { get; set; }
        public int majorId { get; set; }

    }
    public class ExamSlotRoomList
    {
        public List<TeacherExamSlotRoom> teacherExamslotRoom { get; set; }
        public bool isTheSame { get; set; }
        public int subjectId { get; set; }
        public int subjectName { get; set; }
    }
    public class ExamSlotRoomListGrade
    {
        public List<TeacherExamSlotRoom> teacherExamslotRoom { get; set; }
        public int subjectId { get; set; }
        public int subjectName { get; set; }
    }
}
