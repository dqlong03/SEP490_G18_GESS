using GESS.Entity.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeQuestionDTO
{
    public class PracticeQuestionLitsDTO
    {
       
        public int PracticeQuestionId { get; set; }
        public string Content { get; set; }
        public string? UrlImg { get; set; }
        public bool IsActive { get; set; }

        public string CreatedBy { get; set; }

        public bool IsPublic { get; set; }
        public string ChapterName { get; set; } 

        public string CategoryExamName { get; set; }
        public string LevelQuestionName { get; set; }
        public string SemesterName { get; set; }
        
    }
}
