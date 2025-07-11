using GESS.Entity.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Student
{
    public class StudentCreateDTO
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Code { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Fullname { get; set; }
        public bool Gender { get; set; }
        public bool IsActive { get; set; }
        public string? Password { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime EnrollDate { get; set; } = DateTime.Now;
        public DateTime? EndDate { get; set; }
        public int? CohortId { get; set; }
    }
}
