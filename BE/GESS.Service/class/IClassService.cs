using GESS.Entity.Entities;
using GESS.Model.Chapter;
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
        Task<ClassCreateDTO> CreateClassAsync(ClassCreateDTO classCreateDto);
        Task<IEnumerable<ClassListDTO>> GetAllClassAsync(string? name = null, int pageNumber = 1, int pageSize = 10);

    }
}
