using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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

        // Thành phần điểm (VD: Thi giữa kỳ chiếm 30%), tối đa 50 ký tự
        [StringLength(50, ErrorMessage = "Thành phần điểm không được vượt quá 50 ký tự!")]
        public string GradeComponent { get; set; }
    }
}
