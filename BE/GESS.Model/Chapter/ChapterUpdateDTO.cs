using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Chapter
{
    public class ChapterUpdateDTO
    {
        public int ChapterId { get; set; }
        public string ChapterName { get; set; }
        public string Description { get; set; }
        public int SubjectId { get; set; }
    }
}
