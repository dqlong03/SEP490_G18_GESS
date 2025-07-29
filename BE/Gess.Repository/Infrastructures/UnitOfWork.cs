using GESS.Entity.Base;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Repository.Implement;
using GESS.Repository.Interface;
using GESS.Repository.refreshtoken;
using Microsoft.AspNetCore.Identity;
using System;
using System.Threading.Tasks;

namespace Gess.Repository.Infrastructures
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly GessDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;
        private bool _disposed;

        // Lazy initialization cho các repository
        private IUserRepository _userRepository;
        private IRefreshTokenRepository _refreshTokenRepository;
        private IChapterRepository _chapterRepository;
        private ITeacherRepository _teacherRepository;
        private IExaminationRepository _examinationRepository;
        private ISubjectRepository _subjectRepository;
        private IMajorRepository _majorRepository;
        private ITrainingProgramRepository _trainingProgramRepository;
        private IStudentRepository _studentRepository;
        private IClassRepository _classRepository;
        private ISemesterRepository _semesterRepository;
        private ICateExamSubRepository _cateExamSubRepository;
        private IPracticeExamPaperRepository _practiceExamPaperRepository;
        private IPracticeQuestionsRepository _practiceQuestionsRepository;
        private ILevelQuestionRepository _levelQuestionRepository;
        private IMultipleAnswerRepository _multipleAnswerRepository;
        private IExamRepository _examRepository;
        private IPracticeAnswersRepository _practiceAnswersRepository;
        private IRoomRepository _roomRepository;
        private IExamScheduleRepository _examSchelduleRepository;
        private IExamSlotRepository _examSlotRepository;
        private IGradeScheduleRepository _gradeScheduleRepository;
        private IAssignGradeCreateExamRepository _assignGradeCreateExamRepository;
        private IFinaExamRepository _finalPracExamRepository;
        private IFinalExamPaperRepository _finalExamPaperRepository;
        public UnitOfWork(GessDbContext context, UserManager<User> userManager, RoleManager<IdentityRole<Guid>> roleManager)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
            _roleManager = roleManager ?? throw new ArgumentNullException(nameof(roleManager));
        }

        public GessDbContext DataContext => _context;

        public IUserRepository UserRepository => _userRepository ??= new UserRepository(_context, _userManager);
        public IRefreshTokenRepository RefreshTokenRepository => _refreshTokenRepository ??= new RefreshTokenRepository(_context);
        public IChapterRepository ChapterRepository => _chapterRepository ??= new ChapterRepository(_context);
        public ITeacherRepository TeacherRepository => _teacherRepository ??= new TeacherRepository(_context, _userManager);
        public IExaminationRepository ExaminationRepository => _examinationRepository ??= new ExaminationRepository(_context, _userManager);
        public ISubjectRepository SubjectRepository => _subjectRepository ??= new SubjectRepository(_context);
        public IMajorRepository MajorRepository => _majorRepository ??= new MajorRepository(_context);
        public ITrainingProgramRepository TrainingProgramRepository => _trainingProgramRepository ??= new TrainingProgramRepository(_context);
        public IStudentRepository StudentRepository => _studentRepository ??= new StudentRepository(_context, _userManager);
        public IClassRepository ClassRepository => _classRepository ??= new ClassRepository(_context);
        public ISemesterRepository SemesterRepository => _semesterRepository ??= new SemesterRepository(_context);
        public ICateExamSubRepository CateExamSubRepository => _cateExamSubRepository ??= new CateExamSubRepository(_context);
        public IPracticeQuestionsRepository PracticeQuestionsRepository => _practiceQuestionsRepository ??= new PracticeQuestionsRepository(_context);
        public UserManager<User> UserManager => _userManager;
        public RoleManager<IdentityRole<Guid>> RoleManager => _roleManager;

        // ThaiNH_Initialize_Begin
        public IRoomRepository RoomRepository => _roomRepository ??= new RoomRepository(_context);

        // ThaiNH_Initialize_End

        public IExamRepository ExamRepository => _examRepository ??= new ExamRepository(_context);

        public IMultipleAnswerRepository MultipleAnswerRepository => _multipleAnswerRepository ??= new MultiAnswerRepository(_context);
        public IMultipleExamRepository MultipleExamRepository => new MultipleExamRepository(_context);
        public ICategoryExamRepository CategoryExamRepository => new CategoryExamRepository(_context);
        public IMultipleQuestionRepository MultipleQuestionRepository => new MultipleQuestionRepository(_context);
        public ILevelQuestionRepository LevelQuestionRepository => _levelQuestionRepository ??= new LevelQuestionRepository(_context);
        public IPracticeExamRepository PracticeExamRepository => new PracticeExamRepository(_context);
        public IPracticeExamPaperRepository PracticeExamPaperRepository => new PracticeExamPaperRepository(_context);
        public IPracticeAnswersRepository PracticeAnswersRepository => _practiceAnswersRepository??= new PracticeAnswersRepository(_context);
        public IExamScheduleRepository ExamScheduleRepository => _examSchelduleRepository ??= new ExamScheduleRepository(_context);
        public IExamSlotRepository ExamSlotRepository => new ExamSlotRepository(_context);
        public IGradeScheduleRepository GradeScheduleRepository => _gradeScheduleRepository ??= new GradeScheduleRepository(_context);
        public IFinalExamPaperRepository FinalExamPaperRepository => _finalExamPaperRepository ??= new FinalExamPaperRepository(_context);

        public IAssignGradeCreateExamRepository AssignGradeCreateExamRepository => _assignGradeCreateExamRepository??= new AssignGradeCreateExamRepository(_context);
        public IFinaExamRepository FinalPracExamRepository => _finalPracExamRepository ??= new FinaExamRepository(_context);

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
            if (!_disposed)
            {
                _context.Dispose();
                _disposed = true;
            }
            }
    }
}