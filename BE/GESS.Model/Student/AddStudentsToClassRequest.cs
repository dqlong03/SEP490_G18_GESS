using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Student
{
    public class AddStudentsToClassRequest
    {
        public int ClassId { get; set; }
        public List<StudentAddDto> Students { get; set; } = new();
    }
    public class StudentAddDto
    {
        public string Email { get; set; }
        public string Code { get; set; }
        public string? FullName { get; set; }
        public bool? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string URLAvatar { get; set; }

        //public int? CohortId { get; set; }
    }

}
