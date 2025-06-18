using GESS.Entity.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Teacher
{
    public class TeacherUpdateRequest
    {
        // User properties
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Fullname { get; set; }
        public bool Gender { get; set; }
        public string? Code { get; set; }
        public bool IsActive { get; set; }

        // Teacher properties
        public int? MajorId { get; set; }
        public string? MajorName { get; set; }
        public DateTime? HireDate { get; set; }
    }
}
