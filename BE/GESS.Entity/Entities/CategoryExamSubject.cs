using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    // 6. CategoryExamSubject - Bảng trung gian giữa CategoryExam và Subject (liên kết danh mục kỳ thi với môn học)
    public class CategoryExamSubject
    {
        // Khóa ngoại liên kết đến danh mục kỳ thi (CategoryExam)
        public int CategoryExamId { get; set; }
        public CategoryExam CategoryExam { get; set; }

        // Khóa ngoại liên kết đến môn học (Subject)
        public int SubjectId { get; set; }
        public Subject Subject { get; set; }

        // ThaiNH_Modified_UserProfile_Begin
        [Required]
        [Column(TypeName = "DECIMAL(4,1)")]
        public decimal GradeComponent { get; set; }

        [Column(TypeName = "BIT")]
        public bool IsDelete { get; set; }
        // ThaiNH_Modified_UserProfile_End
    }
}
