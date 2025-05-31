using GESS.Entity.Base;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.refreshtoken;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Gess.Repository.Infrastructures
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly GessDbContext _context;
        public  GessDbContext DataContext => _context;
        private IRefreshTokenRepository _refreshTokenRepository; 
        private bool _disposed;



        public IRefreshTokenRepository RefreshTokenRepository =>
    _refreshTokenRepository ??= new RefreshTokenRepository(_context);

        public UnitOfWork(GessDbContext context= null)
        {
            _context = context;
        }

        public IBaseRepository<T> BaseRepository<T>() where T : BaseEntity
        {
            return new BaseRepository<T>(_context);
        }

        public int SaveChanges()
        {
            return _context.SaveChanges();
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
