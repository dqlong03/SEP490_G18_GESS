using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Entities
{
    public class StudentExamSlotRoom
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int StudentIdExamSlotRoomId { get; set; }
        // Khóa ngoại liên kết đến Student 
        [Required(ErrorMessage = "StudentId không được để trống!")]
        public Guid StudentId { get; set; }
        public Student Student { get; set; }
        // Khóa ngoại liên kết đến ExamSlotRoom 
        [Required(ErrorMessage = "ExamSlotRoomId không được để trống!")]
        public int ExamSlotRoomId { get; set; }
        public ExamSlotRoom ExamSlotRoom { get; set; }

    }
}
