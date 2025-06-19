using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.User
{
    public class UserListDTO
    {
        
        public Guid UserId { get; set; }

        // ThaiNH_Modified_UserProfile_Begin
        public string Fullname { get; set; }
        //public string FirstName { get; set; }
        //public string LastName { get; set; }


        public string UserName { get; set; }
        public string Email { get; set; }

        public DateTime? DateOfBirth { get; set; }
        public string? PhoneNumber { get; set; }
        // ThaiNH_Modified_UserProfile_End
     
        public bool Gender { get; set; }
        public string? Code { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
        public string? MainRole { get; set; }
        public bool IsActive { get; set; } = true;

    }
}
