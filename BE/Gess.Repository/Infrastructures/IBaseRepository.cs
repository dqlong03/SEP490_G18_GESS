using GESS.Model.Subject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Gess.Repository.Infrastructures
{
    public interface IBaseRepository<TEntity>
    {
        /// <summary>
        /// Change state of entity to added
        /// </summary>
        /// <param name="entity"></param>
        void Create(TEntity entity);

        /// <summary>
        /// Change state of entity to deleted
        /// </summary>
        /// <param name="entity"></param>

        Task CreateAsync(TEntity entity);
        void Delete(TEntity entity);

        /// <summary>
        /// Delete <paramref name="TEntity"></paramref> from database
        /// </summary>
        /// <param name="ids"></param>
        /// <returns></returns>
        void Delete(Guid id);

        /// <summary>
        /// Change state of entity to modified
        /// </summary>
        /// <param name="entity"></param>


        void Delete(int id);
        void Update(TEntity entity);

        /// <summary>
        /// Get all <paramref name="TEntity"></paramref> from database by Id
        /// </summary>
        /// <returns></returns>
        IEnumerable<TEntity> GetAll();

        TEntity GetById(Guid id);
        TEntity GetById(int id);


        /// <summary>
        /// Get <paramref name="TEntity"></paramref> from database
        /// </summary>
        /// <param name="ids"></param>
        /// <returns></returns>
        TEntity Find(params object[] id);

        Task<TEntity> GetByIdAsync(Guid id);
        Task<TEntity> GetByIdAsync(int id);

        IQueryable<TEntity> GetQuery();
        IQueryable<TEntity> GetQuery(Expression<Func<TEntity, bool>> where);
        Task<List<TEntity>> GetAllAsync(Func<object, bool> value);
        Task<List<TEntity>> GetAllAsync();
        Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> predicate);
    }
}
