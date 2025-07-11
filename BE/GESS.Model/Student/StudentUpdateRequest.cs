using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Student
{
    public class StudentUpdateRequest
    {
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Fullname { get; set; }
        public bool Gender { get; set; }
        public string? Code { get; set; }
        public string? AvatarUrl { get; set; }

        /// <summary>
        /// Defaults to true, indicating that the student is active.
        /// </summary>
        public bool IsActive { get; set; }
    }
}
