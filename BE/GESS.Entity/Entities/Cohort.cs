using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 35. Cohort - Đại diện cho niên khóa (VD: Khóa 2023-2027)
    public class Cohort
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CohortId { get; set; }

        // Tên niên khóa, không được để trống, tối đa 50 ký tự
        [Required(ErrorMessage = "Tên niên khóa không được để trống!")]
        [StringLength(50, ErrorMessage = "Tên niên khóa không được vượt quá 50 ký tự!")]
        public string CohortName { get; set; }

        // Danh sách sinh viên thuộc niên khóa này
        public ICollection<Student> Students { get; set; }

        // Danh sách chương trình đào tạo áp dụng cho niên khóa này (qua bảng trung gian ApplyTrainingProgram)
        public ICollection<ApplyTrainingProgram> ApplyTrainingPrograms { get; set; }

        // Constructor khởi tạo các danh sách
        public Cohort()
        {
            Students = new List<Student>();
            ApplyTrainingPrograms = new List<ApplyTrainingProgram>();
        }
    }
}
