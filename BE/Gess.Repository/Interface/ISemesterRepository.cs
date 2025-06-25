using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.SemestersDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface ISemesterRepository : IBaseRepository<Semester>
    {
        Task<IEnumerable<Semester>> GetAllAsync(Expression<Func<Semester, bool>> filter);

        // ThaiNH_Add_ManageSemester&ManageRoom_Begin
        Task<List<SemesterListDTO>> GetAllChooseSemesterAsync();
        Task AddRangeAsync(List<Semester> entities);
        Task UpdateRangeAsync(List<Semester> entities);
        Task<List<SemesterResponse>> GetSemestersByYearAsync(int year, Guid userId);
        Task<List<Semester>> GetAllEntitiesAsync();
        // ThaiNH_Add_ManageSemester&ManageRoom_End
    }
}
