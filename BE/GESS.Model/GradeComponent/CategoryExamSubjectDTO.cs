using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

// ThaiNH_Create_UserProfile
namespace GESS.Model.GradeComponent
{
    public class CategoryExamSubjectDTO
    {
        public int SubjectId { get; set; }
        public int CategoryExamId { get; set; }

        [Range(0.1, 100, ErrorMessage = "Thành phần điểm phải nằm trong khoảng từ 0 đến 100!")]
        [Required(ErrorMessage = "Thành phần điểm là bắt buộc phải nhập!")]
        public decimal GradeComponent { get; set; }
        public bool IsDelete { get; set; }

    }
}
