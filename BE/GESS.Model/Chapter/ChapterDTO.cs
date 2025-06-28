using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Chapter
{
    public class ChapterDTO
    {
        public int Id { get; set; }
        public string ChapterName { get; set; }
        public string Description { get; set; }
        // ThaiNH_Add_UpdateMark&UserProfile_Begin
        public string Curriculum { get; set; }
        // ThaiNH_Add_UpdateMark&UserProfile_End

    }



    // <tuan>
    public class ChapterInClassDTO
    {
        public int ChapterId { get; set; }
        public string ChapterName { get; set; }
        public string Description { get; set; }
    }
    //


}
