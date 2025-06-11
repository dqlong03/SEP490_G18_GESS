using GESS.Entity.Entities;
using GESS.Model.Class;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service
{
    public interface IClassService : IBaseService<Class>
    {
        Task<IEnumerable<ClassListDTO>> GetAllClassesAsync();
        Task<ClassCreateDTO> CreateClassAsync(ClassCreateDTO classCreateDto);
    }
}
