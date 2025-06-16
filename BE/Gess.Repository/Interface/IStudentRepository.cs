using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IStudentRepository : IBaseRepository<Student>
    {
        Task<Student> GetStudentbyUserId(Guid userId);
        Task AddStudent(Guid id, Student student);
    }
}
