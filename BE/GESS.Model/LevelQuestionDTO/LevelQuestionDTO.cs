using GESS.Entity.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.LevelQuestionDTO
{
    public class LevelQuestionDTO
    {
        
        public int LevelQuestionId { get; set; }

        public string LevelQuestionName { get; set; }

    }
}
