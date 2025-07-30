using GESS.Entity.Base;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Subject;
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
        IPracticeExamRepository PracticeExamRepository { get; }
        IPracticeExamPaperRepository PracticeExamPaperRepository { get; }
        ISemesterRepository SemesterRepository { get; }

        IMultipleAnswerRepository MultipleAnswerRepository { get; }

        IExamRepository ExamRepository { get; }

        IPracticeQuestionsRepository PracticeQuestionsRepository { get; }
        ILevelQuestionRepository LevelQuestionRepository { get; }
        // ThaiNH_Initialize_Begin
        IRoomRepository RoomRepository { get; }
        ICateExamSubRepository CateExamSubRepository { get; }
        // ThaiNH_Initialize_End
        IPracticeAnswersRepository PracticeAnswersRepository { get; }
        IFinalExamPaperRepository FinalExamPaperRepository { get; }

        IExamScheduleRepository ExamScheduleRepository { get; }
        IExamSlotRepository ExamSlotRepository { get; }
        IAssignGradeCreateExamRepository AssignGradeCreateExamRepository { get; }
        IGradeScheduleRepository GradeScheduleRepository { get; }
        IFinaExamRepository FinalPracExamRepository { get; }
        UserManager<User> UserManager { get; }
        RoleManager<IdentityRole<Guid>> RoleManager { get; }
    }
}
