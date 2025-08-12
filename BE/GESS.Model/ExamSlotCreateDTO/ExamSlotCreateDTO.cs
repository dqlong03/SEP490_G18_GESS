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
        public List<StudentAddDto> students { get; set; }
        public List<TeacherCreationFinalRequest> teachers { get; set; }
        public List<RoomListDTO> rooms { get; set; }
        public List<GradeTeacherResponse> gradeTeachers { get; set; }
        public DateTime StartDate { get; set; }
        public int Duration { get; set; }
        public int ExamType { get; set; } 
        public DateTime StartTimeInday { get; set; }
        public DateTime EndTimeInDay { get; set; }
        public int RelaxationTime { get; set; } 
        public bool OptimizedByRoom { get; set; } = false;
        public bool OptimizedByTeacher { get; set; } = false;
        public bool OptimizedBySlotExam { get; set; } = true;

    }
}
