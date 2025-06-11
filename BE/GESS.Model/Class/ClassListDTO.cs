using GESS.Entity.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Class
{
    public class ClassListDTO
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ClassId { get; set; }

        public string ClassName { get; set; }
        
        public string SubjectName { get; set; }
       
        public string Semester { get; set; }
    
        
        

  
    }
}
