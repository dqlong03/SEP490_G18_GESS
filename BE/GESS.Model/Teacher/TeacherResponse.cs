using GESS.Entity.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Teacher
{
    public class TeacherResponse
    {
        public Guid TeacherId { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public bool Gender { get; set; }
        public bool IsActive { get; set; }

        public List<MajorTeacherDto> MajorTeachers { get; set; }
        public DateTime HireDate { get; set; } = DateTime.Now;
    }
}
