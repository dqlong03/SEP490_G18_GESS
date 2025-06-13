using GESS.Entity.Base;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Interface;
using GESS.Repository.refreshtoken;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Gess.Repository.Infrastructures
{
    public interface IUnitOfWork : IDisposable
    {
        GessDbContext DataContext { get; }
        int SaveChanges();

        Task<int> SaveChangesAsync();
        IBaseRepository<T> BaseRepository<T>() where T : class;

        //<summary> khai báo IRepository in here</summary>
        IUserRepository UserRepository { get; }
        IRefreshTokenRepository RefreshTokenRepository { get; }
        IChapterRepository ChapterRepository { get; }
        ITeacherRepository TeacherRepository { get; }
        IExaminationRepository ExaminationRepository { get; }
        ISubjectRepository SubjectRepository { get; }
        IMajorRepository MajorRepository { get; }
        ITrainingProgramRepository TrainingProgramRepository { get; }

        IClassRepository ClassRepository { get; }


        // ThaiNH_Initialize_Begin
        ICateExamSubRepository CateExamSubRepository { get; }
        // ThaiNH_Initialize_End

    }
}
