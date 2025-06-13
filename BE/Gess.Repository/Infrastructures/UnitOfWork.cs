using GESS.Entity.Base;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Implement;
using GESS.Repository.Interface;
using GESS.Repository.refreshtoken;
using Microsoft.AspNetCore.Identity;
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
        private IUserRepository _userRepository;
        private IChapterRepository _chapterRepository;

        // ThaiNH_Initialize_Begin
        private ICateExamSubRepository _cateSubRepository;
        // ThaiNH_Initialize_End

        private IExaminationRepository _examinationRepository;
        private ITeacherRepository _teacherRepository;
        private IClassRepository _classRepository;
        private readonly UserManager<User> _userManager;
        private ISubjectRepository _subjectRepository;
        private IMajorRepository _majorRepository;
        private bool _disposed;

        public UnitOfWork(GessDbContext context, UserManager<User> userManager = null)
        {
            _context = context;
            _userManager = userManager;
        }

        public IUserRepository UserRepository =>  _userRepository ??= new UserRepository(_context);
        public IRefreshTokenRepository RefreshTokenRepository => _refreshTokenRepository ??= new RefreshTokenRepository(_context);

        public IChapterRepository ChapterRepository => _chapterRepository ??= new ChapterRepository(_context);

        // ThaiNH_Initialize_Begin
        public ICateExamSubRepository CateExamSubRepository => _cateSubRepository ??= new CateExamSubRepository(_context);
        // ThaiNH_Initialize_End

        public IExaminationRepository ExaminationRepository => _examinationRepository ??= new ExaminationRepository(_context, _userManager);


        public ITeacherRepository TeacherRepository => _teacherRepository ??= new TeacherRepository(_context, _userManager);
        public IClassRepository ClassRepository => _classRepository ??= new ClassRepository(_context);

        public ISubjectRepository SubjectRepository => _subjectRepository ??= new SubjectRepository(_context);

        public IMajorRepository MajorRepository => _majorRepository ??= new MajorRepository(_context);
        public ITrainingProgramRepository TrainingProgramRepository => new TrainingProgramRepository(_context);

        public UnitOfWork(GessDbContext context= null)
        {
            _context = context;
        }

        public IBaseRepository<T> BaseRepository<T>() where T : class
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
