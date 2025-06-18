using GESS.Entity.Base;
using GESS.Entity.Contexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Gess.Repository.Infrastructures
{
    public class BaseRepository<TEntity> : IBaseRepository<TEntity> where TEntity : class
    {
        protected readonly GessDbContext dataContext;
        protected readonly DbSet<TEntity> dbSet;

        public BaseRepository(GessDbContext context)
        {
            dataContext = context;
            // Find Property with typeof(T) on dataContext
            var typeOfDbSet = typeof(DbSet<TEntity>);
            foreach (var prop in context.GetType().GetProperties())
            {
                if (typeOfDbSet == prop.PropertyType)
                {
                    dbSet = prop.GetValue(context, null) as DbSet<TEntity>;
                    break;
                }
            }

            if (dbSet == null)
            {
                dbSet = context.Set<TEntity>();
            }
        }

        public void Create(TEntity entity)
        {
            dbSet.Add(entity);
        }

        public async Task CreateAsync(TEntity entity)
        {
            await dbSet.AddAsync(entity);
        }

        public void Delete(TEntity entity)
        {
            dbSet.Remove(entity);
        }

        public void Delete(Guid id)
        {
            var entity = dbSet.Find(id);
            if (entity != null)
            {
                dbSet.Remove(entity);
            }
        }
        public void Delete(int id)
        {
            var entity = dbSet.Find(id);
            if (entity != null)
            {
                dbSet.Remove(entity);
            }
        }

        public async Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> predicate)
        {
            return await dbSet.AsNoTracking().AnyAsync(predicate);
        }

        public TEntity Find(params object[] primaryKey)
        {
            return dbSet.Find(primaryKey);
        }

        public IEnumerable<TEntity> GetAll()
        {
            return dbSet.AsNoTracking().ToList();
        }

        public async Task<List<TEntity>> GetAllAsync(Func<object, bool> value)
        {
            return await dbSet.AsNoTracking().ToListAsync();
        }
        public async Task<List<TEntity>> GetAllAsync()
        {
            return await dbSet.AsNoTracking().ToListAsync();
        }
        public TEntity GetById(Guid id)
        {
            return dbSet.Find(id);
        }
        public TEntity GetById(int id)
        {
            return dbSet.Find(id);
        }
        public async Task<TEntity> GetByIdAsync(Guid id)
        {
            return await dbSet.FindAsync(id);
        }
        public async Task<TEntity> GetByIdAsync(int id)
        {
            return await dbSet.FindAsync(id);
        }
        public virtual IQueryable<TEntity> GetQuery()
        {
            return dbSet.AsQueryable();
        }

        public IQueryable<TEntity> GetQuery(Expression<Func<TEntity, bool>> where)
        {
            return dbSet.Where(where);
        }

        public async Task<List<TEntity>> GetQueryAsync()
        {
            return await dbSet.ToListAsync();
        }

        public async Task<List<TEntity>> GetQueryAsync(Expression<Func<TEntity, bool>> where)
        {
            return await dbSet.Where(where).ToListAsync();
        }

        public void Update(TEntity entity)
        {
            dbSet.Update(entity);
        }

    }
}
