using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.User
{
    public class UserUpdateRequest
    {
        //public string FirstName { get; set; }
        //public string LastName { get; set; }
        public string Fullname { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string PhoneNumber { get; set; }
        public bool IsActive { get; set; } = true;
        public bool Gender { get; set; }
        public string? Code { get; set; } 

    }
}
