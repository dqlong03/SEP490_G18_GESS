using GESS.Entity.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Teacher
{
    public class TeacherCreationRequest
    {
        [Required(ErrorMessage = "Tên đăng nhập không được bỏ trống")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Email không được bỏ trống")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Số điện thoại không được bỏ trống")]
        public string PhoneNumber { get; set; }

        [Required(ErrorMessage = "Ngày sinh không được bỏ trống")]
        public DateTime DateOfBirth { get; set; }

        [Required(ErrorMessage = "Họ và tên không được bỏ trống")]
        public string Fullname { get; set; }
        public bool Gender { get; set; }
        public bool IsActive { get; set; } = true;
        public string? Password { get; set; } = "Abc123@";

        [Required(ErrorMessage = "Mã giáo viên không được bỏ trống")]
        public string Code { get; set; }


        // Teacher properties
        public int MajorId { get; set; }
        public string? MajorName { get; set; }
        public DateTime HireDate { get; set; } = DateTime.Now;
    }
    public class TeacherCreationFinalRequest
    {
        public Guid TeacherId { get; set; }
        [Required(ErrorMessage = "Tên đăng nhập không được bỏ trống")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Email không được bỏ trống")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Số điện thoại không được bỏ trống")]
        public string PhoneNumber { get; set; }

        [Required(ErrorMessage = "Ngày sinh không được bỏ trống")]
        public DateTime DateOfBirth { get; set; }

        [Required(ErrorMessage = "Họ và tên không được bỏ trống")]
        public string Fullname { get; set; }
        public bool Gender { get; set; }
        public bool IsActive { get; set; } = true;
        public string? Password { get; set; } = "Abc123@";

        [Required(ErrorMessage = "Mã giáo viên không được bỏ trống")]
        public string Code { get; set; }


        // Teacher properties
        public int MajorId { get; set; }
        public string? MajorName { get; set; }
        public DateTime HireDate { get; set; } = DateTime.Now;
    }
}
