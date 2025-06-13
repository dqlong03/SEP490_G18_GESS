using GESS.Model.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Examination
{
    public class ExaminationResponse
    {
        public Guid ExaminationId { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Fullname { get; set; }
        public bool Gender { get; set; }
        public bool IsActive { get; set; }
        public DateTime HireDate { get; set; }
    }
}
