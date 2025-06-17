using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Class
{
    public class ClassListDTO
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; }
        public Guid TeacherId { get; set; }
        public int SubjectId { get; set; }
        public int SemesterId { get; set; }
        public string TeacherName { get; set; }
        public string SubjectName { get; set; }
        public string SemesterName { get; set; }
        public int StudentCount { get; set; }
    }
}
