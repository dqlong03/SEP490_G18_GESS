using GESS.Entity.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.PracticeExamPaper
{
    public class ExamPaperListDTO
    {
        
        public int PracExamPaperId { get; set; }

        public string PracExamPaperName { get; set; }

        public int NumberQuestion { get; set; }

        public DateTime CreateAt { get; set; }

        // Trạng thái đề thi (VD: "Draft", "Published"), tối đa 20 ký tự
        public string SubjectName { get; set; }
        public string SemesterName { get; set; }
        public string CategoryExamName { get; set; }
        public string Status { get; set; }

        public string CreateBy { get; set; }
    }
    public class ExamPaperDTO
    {

        public int PracExamPaperId { get; set; }

        public string PracExamPaperName { get; set; }

        public string SemesterName { get; set; }
    }
}
