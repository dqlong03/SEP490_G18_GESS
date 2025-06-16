using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service
{
    public interface IBaseService<TEntity>
    {
        Task<T> Add<T>(TEntity entity);

        Task<int> AddAsync(TEntity entity);

        int AddRange(IEnumerable<TEntity> entities);

        Task<int> AddRangeAsync(IEnumerable<TEntity> entities);

        bool Update(TEntity entity);

        Task<bool> UpdateAsync(TEntity entity);

        bool Delete(Guid id);

        Task<bool> DeleteAsync(Guid id);
        Task<bool> DeleteAsync(int id);

        TEntity GetById(Guid id);

        Task<TEntity> GetByIdAsync(Guid id);
        Task<TEntity> GetByIdAsync(int id);


        IEnumerable<TEntity> GetAll();
       

        

    }
}
