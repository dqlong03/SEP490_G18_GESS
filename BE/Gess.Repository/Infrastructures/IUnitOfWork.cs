using GESS.Entity.Base;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Implement;
using GESS.Repository.Interface;
using GESS.Repository.refreshtoken;
using Microsoft.AspNetCore.Identity;
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
        IMultipleExamRepository MultipleExamRepository { get; }
        ICategoryExamRepository CategoryExamRepository { get; }
        IStudentRepository StudentRepository { get; }
        IClassRepository ClassRepository { get; }
        IMultipleQuestionRepository MultipleQuestionRepository { get; }


        ISemesterRepository SemesterRepository { get; }
        // ThaiNH_Initialize_Begin
        ICateExamSubRepository CateExamSubRepository { get; }
        // ThaiNH_Initialize_End
        UserManager<User> UserManager { get; }
        RoleManager<IdentityRole<Guid>> RoleManager { get; }
    }
}
