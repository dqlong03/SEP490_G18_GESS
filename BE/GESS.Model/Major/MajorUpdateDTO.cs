using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Major
{
    public class MajorUpdateDTO
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        // PK và Identity tự tăng trong SQL
        public int MajorId { get; set; }
        // Tên ngành, không được để trống, tối đa 100 ký tự(NVARCHAR(100) NOT NULL trong SQL)
        [Required(ErrorMessage = "Tên ngành không được để trống!")]
        [StringLength(1000, ErrorMessage = "Tên ngành không được vượt quá 1000 ký tự!")]
        public string MajorName { get; set; }

        // Ngày bắt đầu ngành, không được để trống (DATE NOT NULL trong SQL)
        [Required(ErrorMessage = "Ngày bắt đầu không được để trống!")]
        public DateTime StartDate { get; set; }
        // Ngày kết thúc ngành, (DATE  NULL trong SQL)
        // [Required(ErrorMessage = "Ngày kết thúc không được để trống!")]
        public DateTime? EndDate { get; set; }

        // Trạng thái hoạt động của ngành (true = đang hoạt động, false = không hoạt động), mặc định là true (BIT NOT NULL DEFAULT 1 trong SQL)
        [Required(ErrorMessage = "Trạng thái không được để trống!")]
        [Column(TypeName = "BIT")]

        public bool IsActive { get; set; } = true;
    }
}
