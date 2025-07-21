using GESS.Entity.Entities;
using GESS.Model.SemestersDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.semesters
{
    public interface ISemestersService : IBaseService<Semester>
    {
        // Lấy danh sách học kỳ hiên tại
        Task<IEnumerable<SemesterResponse>> GetCurrentSemestersAsync();

        // ThaiNH_Add_ManageSemester&ManageRoom_Begin
        Task<List<SemesterListDTO>> GetAllCurrentSemestersAsync();
        Task CreateAsync(SemesterCreateDTO request);
        Task UpdateAsync(SemesterUpdateDTO request);
        // ThaiNH_Add_ManageSemester&ManageRoom_End

        Task<List<SemesterResponse>> GetSemestersByYearAsync(int? year, Guid userId);
    }
}
