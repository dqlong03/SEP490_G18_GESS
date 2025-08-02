using GESS.Entity.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Class
{
    public class ClassCreateDTO
    {
        [Required(ErrorMessage = "Giáo viên không được để trống!")]
        public Guid TeacherId { get; set; }

        [Required(ErrorMessage = "Môn học không được để trống!")]
        public int SubjectId { get; set; }

        [Required(ErrorMessage = "Học kỳ không được để trống!")]
        public int SemesterId { get; set; }
       
        [Required(ErrorMessage = "Tên lớp học không được để trống!")]
        [StringLength(50, ErrorMessage = "Tên lớp học không được vượt quá 50 ký tự!")]
        public string ClassName { get; set; }

        [Required(ErrorMessage = "Danh sách sinh viên không được để trống!")]
        [MinLength(1, ErrorMessage = "Lớp học phải có ít nhất 1 sinh viên!")]
        public List<StudentDTO> Students { get; set; }


    }
    public class StudentDTO
    {
        public Guid StudentId { get; set; }
        public string? Code { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public bool? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int? CohirtId { get; set; }
        public string? Avartar { get; set; }
    }

}
