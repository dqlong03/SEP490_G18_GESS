using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Class
{
    public class StudentExamScoreDTO
    {
        public Guid StudentId { get; set; }
        public string FullName { get; set; }
        public double? Score { get; set; }
        public string Code { get; set; }
    }

}
