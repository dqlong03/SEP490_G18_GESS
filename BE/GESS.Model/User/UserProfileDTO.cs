using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.User
{
    // ThaiNH_Create_UserProfile
    public class UserProfileDTO
    {
        public Guid UserId { get; set; }

        [Required(ErrorMessage = "Họ và tên là bắt buộc.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Họ và tên phải từ 2 đến 100 ký tự.")]
        public string Fullname { get; set; }

        public string Email { get; set; }

        [Required(ErrorMessage = "Ngày sinh là bắt buộc.")]
        [DataType(DataType.Date, ErrorMessage = "Ngày sinh không hợp lệ.")]
        public DateTime DateOfBirth { get; set; }

        [StringLength(15, ErrorMessage = "Số điện thoại không được vượt quá 12 ký tự.")]
        [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
        public string? PhoneNumber { get; set; }

        public bool Gender { get; set; }

        public bool IsActive { get; set; } = true;

    }
}
