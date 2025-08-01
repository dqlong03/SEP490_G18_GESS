using GESS.Entity.Entities;
using GESS.Model.Major;
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
        public DateTime? DateOfBirth { get; set; }
        public string Fullname { get; set; }
        public bool Gender { get; set; }
        public string Code { get; set; }
        public bool IsActive { get; set; }
        public int? MajorId { get; set; }
        public string? MajorName { get; set; }
        public DateTime HireDate { get; set; }
        public bool IsGraded { get; set; }
        public bool IsCreateExam { get; set; }
    }
    public class GradeTeacherResponse
    {
        public Guid ? TeacherId { get; set; }
        public string FullName { get; set; }
        
    }
}
