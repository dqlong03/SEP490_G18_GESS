using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.Subject
{
    public class AllSubjectBySemesterOfStudentDTOResponse
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public bool IsDeleted { get; set; }
    }
}
