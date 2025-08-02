using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.NoQuestionInChapter
{
    public class NoQuestionInChapterDTO
    {
        // Số lượng câu hỏi từ chương này trong kỳ thi, không được để trống
        [Required(ErrorMessage = "Số lượng câu hỏi không được để trống!")]
        public int NumberQuestion { get; set; }
        // Khóa ngoại liên kết đến chương (Chapter)
        public int ChapterId { get; set; }
        public int LevelQuestionId { get; set; }
        public string? ChapterName { get; set; }
        public string? LevelName { get; set; }
    }
}
