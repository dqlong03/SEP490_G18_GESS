using GESS.Entity.Base;
using Gess.Repository.Infrastructures;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GESS.Service
{
    public class BaseService<TEntity> : IBaseService<TEntity> where TEntity : class
    {
        protected readonly IUnitOfWork _unitOfWork;
        protected readonly IBaseRepository<TEntity> _repository;

        public BaseService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _repository = _unitOfWork.BaseRepository<TEntity>();
        }

        public async Task<T> Add<T>(TEntity entity)
        {
            _repository.Create(entity);
            await _unitOfWork.SaveChangesAsync();
            return (T)(object)entity;
        }

        public async Task<int> AddAsync(TEntity entity)
        {
            _repository.Create(entity);
            return await _unitOfWork.SaveChangesAsync();
        }

        public int AddRange(IEnumerable<TEntity> entities)
        {
            foreach (var entity in entities)
            {
                _repository.Create(entity);
            }
            return _unitOfWork.SaveChanges();
        }

        public async Task<int> AddRangeAsync(IEnumerable<TEntity> entities)
        {
            foreach (var entity in entities)
            {
                _repository.Create(entity);
            }
            return await _unitOfWork.SaveChangesAsync();
        }

        public bool Update(TEntity entity)
        {
            _repository.Update(entity);
            return _unitOfWork.SaveChanges() > 0;
        }

        public async Task<bool> UpdateAsync(TEntity entity)
        {
            _repository.Update(entity);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public bool Delete(Guid id)
        {
            _repository.Delete(id);
            return _unitOfWork.SaveChanges() > 0;
        }

        public bool Delete(int id)
        {
            _repository.Delete(id);
            return _unitOfWork.SaveChanges() > 0;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            _repository.Delete(id);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public TEntity GetById(Guid id)
        {
            return _repository.GetById(id);
        }

        public async Task<TEntity> GetByIdAsync(Guid id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public IEnumerable<TEntity> GetAll()
        {
            return _repository.GetAll();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            _repository.Delete(id);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public Task<TEntity> GetByIdAsync(int id)
        {
            return _repository.GetByIdAsync(id);

        }
    }
}
