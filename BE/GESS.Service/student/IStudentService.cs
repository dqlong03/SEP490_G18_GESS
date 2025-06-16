using GESS.Entity.Entities;
using GESS.Model.Student;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.student
{
    public interface IStudentService : IBaseService<Student>
    {
         Task<Student> AddStudentAsync(Guid id, StudentCreateDTO student);
         Task<IEnumerable<StudentFileExcel>> StudentFileExcelsAsync(IFormFile file);
    }
}
