using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    public class TrainingProgram
    {
        // Khóa chính, tự động tăng
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TrainProId { get; set; }

        // Tên chương trình đào tạo, không được để trống, tối đa 100 ký tự
        [Required(ErrorMessage = "Tên chương trình đào tạo không được để trống!")]
        [StringLength(100, ErrorMessage = "Tên chương trình đào tạo không được vượt quá 100 ký tự!")]
        public string TrainProName { get; set; }

        // Ngày bắt đầu chương trình, không được để trống
        [Required(ErrorMessage = "Ngày bắt đầu không được để trống!")]
        public DateTime StartDate { get; set; }

        // Ngày kết thúc chương trình, không được để trống
        [Required(ErrorMessage = "Ngày kết thúc không được để trống!")]
        public DateTime EndDate { get; set; }

        // Tổng số tín chỉ của chương trình, không được để trống
        [Required(ErrorMessage = "Tổng số tín chỉ không được để trống!")]
        public int NoCredits { get; set; }

        // Khóa ngoại liên kết đến ngành (Major), 1 chương trình đào tạo thuộc 1 ngành
        public int MajorId { get; set; }
        public Major Major { get; set; }

        // Danh sách môn học thuộc chương trình đào tạo này (qua bảng trung gian SubjectTrainingProgram)
        public ICollection<SubjectTrainingProgram> SubjectTrainingPrograms { get; set; }

        // Danh sách niên khóa áp dụng chương trình đào tạo này (qua bảng trung gian ApplyTrainingProgram)
        public ICollection<ApplyTrainingProgram> ApplyTrainingPrograms { get; set; }

        // Constructor khởi tạo các danh sách
        public TrainingProgram()
        {
            SubjectTrainingPrograms = new List<SubjectTrainingProgram>();
            ApplyTrainingPrograms = new List<ApplyTrainingProgram>();
        }
    }
}
