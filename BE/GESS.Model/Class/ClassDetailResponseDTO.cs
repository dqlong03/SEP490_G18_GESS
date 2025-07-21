using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Class
{
    public class ClassDetailResponseDTO
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; }
        public List<StudentInClassDTO> Students { get; set; }
        public List<ExamInClassDTO> Exams { get; set; }
    }

    public class StudentInClassDTO
    {
        public Guid StudentId { get; set; }
        public string FullName { get; set; }
        public string? AvatarURL { get; set; }
    }

    public class ExamInClassDTO
    {
        public int ExamId { get; set; }
        public string ExamName { get; set; }
        public string GradeComponent { get; set; }
        public string Status { get; set; }
        public int StudentCount { get; set; }
    }
}
