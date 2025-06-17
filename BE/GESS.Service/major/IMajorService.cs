using GESS.Entity.Entities;
using GESS.Model.Major;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.major
{
    public interface IMajorService : IBaseService<Major>
    {
        Task<IEnumerable<MajorUpdateDTO>> GetAllMajorsAsync(int ? active, string? name = null, DateTime? fromDate = null, DateTime? toDate = null, int pageNumber = 1, int pageSize = 10);
        Task<MajorCreateDTO> CreateMajorAsync(MajorCreateDTO majorCreateDto);
        Task<MajorUpdateDTO> UpdateMajorAsync(int id, MajorUpdateDTO majorUpdateDto);
        Task<MajorDTO> GetMajorById(int majorId);
        Task<MajorUpdateDTO> DeleteMajorById(int majorId);
        Task<int> CountPageAsync(int? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize);
        Task<IEnumerable<MajorUpdateDTO>> GetAllAsync();
        Task<IEnumerable<MajorListDTO>> GetAllMajor();
    }
}
