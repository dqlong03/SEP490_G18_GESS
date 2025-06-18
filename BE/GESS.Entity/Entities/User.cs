using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    public class User : IdentityUser<Guid>
    {
        [Column(TypeName = "BIT")]
        public bool IsDeleted { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // ThaiNH_Modified_UserProfile_Begin
        [Required]
        [Column(TypeName = "NVARCHAR(100)")]
        public string Fullname { get; set; }
        //public string FirstName { get; set; }
        //public string LastName { get; set; }

        public string? Code { get; set; }

        // ThaiNH_Modified_UserProfile_End

        [Column(TypeName = "DATETIME")]
        public DateTime? DateOfBirth { get; set; }

        [Column(TypeName = "NVARCHAR(12)")]
        public string? PhoneNumber { get; set; }

        [Column(TypeName = "BIT")]
        public bool Gender {get; set; }
        public List<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
       
        [Column(TypeName = "BIT")]
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public ICollection<PracticeQuestion> PracticeQuestions { get; set; }
        public Teacher Teacher { get; set; }
        public Student Student { get; set; }
        public ExamService ExamService { get; set; }
        public User()
        {
            PracticeQuestions = new List<PracticeQuestion>();
        }
    }
}
