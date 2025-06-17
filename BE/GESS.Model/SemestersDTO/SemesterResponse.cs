using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.SemestersDTO
{
    public class SemesterResponse
    {
        public int SemesterId { get; set; }
        public string SemesterName { get; set; }

    }
}
