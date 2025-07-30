using GESS.Common;
using GESS.Entity.Configs;
using GESS.Entity.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace GESS.Entity.Contexts
{
    public class GessDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
    {
        public GessDbContext(DbContextOptions<GessDbContext> options) : base(options)
        {
        }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Major> Majors { get; set; }
        public DbSet<TrainingProgram> TrainingPrograms { get; set; }
        public DbSet<SubjectTrainingProgram> SubjectTrainingPrograms { get; set; }
        public DbSet<PreconditionSubject> PreconditionSubjects { get; set; }
        public DbSet<CategoryExam> CategoryExams { get; set; }
        public DbSet<CategoryExamSubject> CategoryExamSubjects { get; set; }
        public DbSet<MultiExam> MultiExams { get; set; }
        public DbSet<Chapter> Chapters { get; set; }
        public DbSet<NoQuestionInChapter> NoQuestionInChapters { get; set; }
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<Teacher> Teachers { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<ExamSlot> ExamSlots { get; set; }
        public DbSet<ExamSlotRoom> ExamSlotRooms { get; set; }
        public DbSet<Class> Classes { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<ExamService> ExamServices { get; set; }
        public DbSet<ClassStudent> ClassStudents { get; set; }
        public DbSet<Semester> Semesters { get; set; }
        //public DbSet<MajorTeacher> MajorTeachers { get; set; }
        public DbSet<MultiExamHistory> MultiExamHistories { get; set; }
        public DbSet<MultiQuestion> MultiQuestions { get; set; }
        public DbSet<MultiAnswer> MultiAnswers { get; set; }
        public DbSet<LevelQuestion> LevelQuestions { get; set; }
        public DbSet<FinalExam> FinalExam { get; set; }
        public DbSet<PracticeQuestion> PracticeQuestions { get; set; }
        public DbSet<PracticeAnswer> PracticeAnswers { get; set; }
        public DbSet<PracticeExamPaper> PracticeExamPapers { get; set; }
        public DbSet<PracticeTestQuestion> PracticeTestQuestions { get; set; }
        public DbSet<PracticeExam> PracticeExams { get; set; }
        public DbSet<NoPEPaperInPE> NoPEPaperInPEs { get; set; }
        public DbSet<PracticeExamHistory> PracticeExamHistories { get; set; }
        public DbSet<QuestionPracExam> QuestionPracExams { get; set; }
        public DbSet<QuestionMultiExam> QuestionMultiExams { get; set; }
        public DbSet<Cohort> Cohorts { get; set; }
        public DbSet<ApplyTrainingProgram> ApplyTrainingPrograms { get; set; }
        public DbSet<StudentExamSlotRoom> StudentExamSlotRoom { get; set; }
        public DbSet<SubjectTeacher> SubjectTeachers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Áp dụng tất cả các config
            modelBuilder.ApplyConfiguration(new UserConfig());
            modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());
            modelBuilder.ApplyConfiguration(new MajorConfig());
            modelBuilder.ApplyConfiguration(new TrainingProgramConfig());
            modelBuilder.ApplyConfiguration(new SubjectConfig());
            modelBuilder.ApplyConfiguration(new ChapterConfig());
            modelBuilder.ApplyConfiguration(new MultiQuestionConfig());
            modelBuilder.ApplyConfiguration(new PracticeQuestionConfig());
            modelBuilder.ApplyConfiguration(new TeacherConfig());
            modelBuilder.ApplyConfiguration(new StudentConfig());
            modelBuilder.ApplyConfiguration(new ExamSlotRoomConfig());
            modelBuilder.ApplyConfiguration(new SemesterConfig());
            modelBuilder.ApplyConfiguration(new CategoryExamConfig());
            modelBuilder.ApplyConfiguration(new MultiExamConfig());
            modelBuilder.ApplyConfiguration(new PracticeExamConfig());
            modelBuilder.ApplyConfiguration(new PracticeExamPaperConfig());
            modelBuilder.ApplyConfiguration(new CohortConfig());
            modelBuilder.ApplyConfiguration(new ClassConfig());
            modelBuilder.ApplyConfiguration(new LevelQuestionConfig());
            modelBuilder.ApplyConfiguration(new RoomConfig());
            modelBuilder.ApplyConfiguration(new ExamSlotConfig());
            modelBuilder.ApplyConfiguration(new MultiExamHistoryConfig());
            modelBuilder.ApplyConfiguration(new PracticeExamHistoryConfig());
            modelBuilder.ApplyConfiguration(new SubjectTeacherConfig());
            modelBuilder.ApplyConfiguration(new ClassStudentConfig());
            modelBuilder.ApplyConfiguration(new ApplyTrainingProgramConfig());
            modelBuilder.ApplyConfiguration(new SubjectTrainingProgramConfig());
            modelBuilder.ApplyConfiguration(new CategoryExamSubjectConfig());
            modelBuilder.ApplyConfiguration(new PreconditionSubjectConfig());
            modelBuilder.ApplyConfiguration(new NoQuestionInChapterConfig());
            modelBuilder.ApplyConfiguration(new NoPEPaperInPEConfig());
            modelBuilder.ApplyConfiguration(new QuestionMultiExamConfig());
            modelBuilder.ApplyConfiguration(new QuestionPracExamConfig());
            modelBuilder.ApplyConfiguration(new PracticeTestQuestionConfig());
            modelBuilder.ApplyConfiguration(new FinalExamConfig());
            modelBuilder.ApplyConfiguration(new MultiAnswerConfig());
            modelBuilder.ApplyConfiguration(new PracticeAnswerConfig());
            modelBuilder.ApplyConfiguration(new StudentExamSlotRoomConfig());

            // Cấu hình NEWSEQUENTIALID() cho các cột Guid
            // modelBuilder.Entity<Student>()
            //     .Property(s => s.StudentId)
            //     .HasDefaultValueSql("NEWSEQUENTIALID()");

            // modelBuilder.Entity<Teacher>()
            //     .Property(t => t.TeacherId)
            //     .HasDefaultValueSql("NEWSEQUENTIALID()");

            // modelBuilder.Entity<MultiExamHistory>()
            //     .Property(meh => meh.ExamHistoryId)
            //     .HasDefaultValueSql("NEWSEQUENTIALID()");

            // modelBuilder.Entity<PracticeExamHistory>()
            //     .Property(peh => peh.PracExamHistoryId)
            //     .HasDefaultValueSql("NEWSEQUENTIALID()");

            // /*
            //  Lưu ý: NEWSEQUENTIALID() chỉ hoạt động khi bạn không cung cấp giá trị StudentId (tức là để nó mặc định là Guid.Empty).
            // Nếu bạn gán StudentId = Guid.NewGuid() trong code, giá trị đó sẽ được ưu tiên.
            //  */

            // // Định nghĩa 43 mối quan hệ

            // // 1. Major <-> TrainingProgram (1-N): 1 ngành có nhiều chương trình học, 1 chương trình học chỉ áp dụng trong 1 ngành
            // // Ý nghĩa: Một ngành (Major) có thể có nhiều chương trình đào tạo (TrainingProgram), nhưng mỗi chương trình đào tạo chỉ thuộc về 1 ngành.
            // modelBuilder.Entity<TrainingProgram>()
            //     .HasOne(tp => tp.Major)
            //     .WithMany(m => m.TrainingPrograms)
            //     .HasForeignKey(tp => tp.MajorId);

            // // 2. Major <-> Teacher (N-N): 1 ngành có nhiều giáo viên, 1 giáo viên cũng có thể có nhiều ngành -> sinh ra bảng MajorTeacher
            // // Ý nghĩa: Một ngành (Major) có thể có nhiều giáo viên (Teacher), và một giáo viên có thể dạy ở nhiều ngành, nên cần bảng trung gian MajorTeacher.
            // modelBuilder.Entity<MajorTeacher>()
            //     .HasKey(mt => new { mt.MajorId, mt.TeacherId });

            // modelBuilder.Entity<MajorTeacher>()
            //     .HasOne(mt => mt.Major)
            //     .WithMany(m => m.MajorTeachers)
            //     .HasForeignKey(mt => mt.MajorId);

            // modelBuilder.Entity<MajorTeacher>()
            //     .HasOne(mt => mt.Teacher)
            //     .WithMany(t => t.MajorTeachers)
            //     .HasForeignKey(mt => mt.TeacherId);

            // // 3. TrainingProgram <-> Subject (N-N): 1 môn học có nhiều chương trình đào tạo, 1 chương trình đào tạo áp dụng cho nhiều môn -> sinh ra bảng SubjectTrainingProgram
            // // Ý nghĩa: Một chương trình đào tạo (TrainingProgram) có thể áp dụng cho nhiều môn học (Subject), và một môn học có thể thuộc nhiều chương trình đào tạo.
            // modelBuilder.Entity<SubjectTrainingProgram>()
            //     .HasOne(stp => stp.TrainingProgram)
            //     .WithMany(tp => tp.SubjectTrainingPrograms)
            //     .HasForeignKey(stp => stp.TrainProId);

            // modelBuilder.Entity<SubjectTrainingProgram>()
            //     .HasOne(stp => stp.Subject)
            //     .WithMany(s => s.SubjectTrainingPrograms)
            //     .HasForeignKey(stp => stp.SubjectId);

            // // 4. Chapter <-> MultiQuestion (1-N): 1 chapter có nhiều câu hỏi trắc nghiệm, 1 câu hỏi trắc nghiệm chỉ nằm trong 1 chapter
            // // Ý nghĩa: Một chương (Chapter) có thể chứa nhiều câu hỏi trắc nghiệm (MultiQuestion), nhưng mỗi câu hỏi trắc nghiệm chỉ thuộc về 1 chương.
            // modelBuilder.Entity<MultiQuestion>()
            //     .HasOne(mq => mq.Chapter)
            //     .WithMany(c => c.MultiQuestions)
            //     .HasForeignKey(mq => mq.ChapterId);

            // // 5. SubjectTrainingProgram <-> Subject (N-N): 1 môn trong chương trình học có thể có nhiều môn là môn tiền điều kiện, 1 môn cũng có thể là tiền điều kiện của nhiều môn khác -> sinh ra bảng PreconditionSubject
            // // Ý nghĩa: Một môn học trong chương trình đào tạo (SubjectTrainingProgram) có thể có nhiều môn tiền điều kiện (Subject), và một môn học có thể là tiền điều kiện của nhiều môn khác.
            // modelBuilder.Entity<PreconditionSubject>()
            //     .HasKey(ps => new { ps.SubTrainingProgramId, ps.PreconditionSubjectId });

            // modelBuilder.Entity<PreconditionSubject>()
            //     .HasOne(ps => ps.SubjectTrainingProgram)
            //     .WithMany(stp => stp.PreconditionSubjects)
            //     .HasForeignKey(ps => ps.SubTrainingProgramId);

            // modelBuilder.Entity<PreconditionSubject>()
            //     .HasOne(ps => ps.PreSubject)
            //     .WithMany(s => s.PreconditionSubjects)
            //     .HasForeignKey(ps => ps.PreconditionSubjectId);

            // // 6. Chapter <-> MultiExam (N-N): 1 bài thi trắc nghiệm có nhiều chương thi, 1 chương có thể nằm trong nhiều bài thi -> sinh ra bảng NoQuestionInChapter
            // // Ý nghĩa: Một kỳ thi trắc nghiệm (MultiExam) có thể lấy câu hỏi từ nhiều chương (Chapter), và một chương có thể được sử dụng trong nhiều kỳ thi trắc nghiệm.
            // modelBuilder.Entity<NoQuestionInChapter>()
            //     .HasOne(nq => nq.Chapter)
            //     .WithMany(c => c.NoQuestionInChapters)
            //     .HasForeignKey(nq => nq.ChapterId);

            // modelBuilder.Entity<NoQuestionInChapter>()
            //     .HasOne(nq => nq.MultiExam)
            //     .WithMany(me => me.NoQuestionInChapters)
            //     .HasForeignKey(nq => nq.MultiExamId);

            // // 7. Subject <-> Chapter (1-N): 1 môn có nhiều chương, 1 chương cụ thể chỉ nằm ở 1 môn cụ thể
            // // Ý nghĩa: Một môn học (Subject) có thể có nhiều chương (Chapter), nhưng mỗi chương chỉ thuộc về 1 môn học.
            // modelBuilder.Entity<Chapter>()
            //     .HasOne(c => c.Subject)
            //     .WithMany(s => s.Chapters)
            //     .HasForeignKey(c => c.SubjectId);

            // // 8. Subject <-> MultiExam (1-N): 1 môn học có nhiều bài thi, 1 bài thi cụ thể chỉ nằm trong 1 môn cụ thể
            // // Ý nghĩa: Một môn học (Subject) có thể có nhiều kỳ thi trắc nghiệm (MultiExam), nhưng mỗi kỳ thi trắc nghiệm chỉ thuộc về 1 môn học.
            // modelBuilder.Entity<MultiExam>()
            //     .HasOne(me => me.Subject)
            //     .WithMany(s => s.MultiExams)
            //     .HasForeignKey(me => me.SubjectId);

            // // 9. Subject <-> CategoryExam (N-N): 1 môn học có nhiều loại bài thi, 1 loại bài thi có thể nằm ở nhiều môn học -> sinh ra CategoryExamSubject
            // // Ý nghĩa: Một môn học (Subject) có thể thuộc nhiều danh mục kỳ thi (CategoryExam), và một danh mục kỳ thi có thể áp dụng cho nhiều môn học.
            // modelBuilder.Entity<CategoryExamSubject>()
            //     .HasKey(ces => new { ces.CategoryExamId, ces.SubjectId });

            // modelBuilder.Entity<CategoryExamSubject>()
            //     .HasOne(ces => ces.CategoryExam)
            //     .WithMany(ce => ce.CategoryExamSubjects)
            //     .HasForeignKey(ces => ces.CategoryExamId);

            // modelBuilder.Entity<CategoryExamSubject>()
            //     .HasOne(ces => ces.Subject)
            //     .WithMany(s => s.CategoryExamSubjects)
            //     .HasForeignKey(ces => ces.SubjectId);

            // // 10. Subject <-> Teacher (N-N): 1 môn học có nhiều giảng viên dạy, 1 giảng viên có thể dạy nhiều môn -> sinh ra bảng Class
            // // Ý nghĩa: Một môn học (Subject) có thể được dạy bởi nhiều giáo viên (Teacher), và một giáo viên có thể dạy nhiều môn học, thông qua bảng Class.
            // modelBuilder.Entity<Class>()
            //     .HasOne(c => c.Subject)
            //     .WithMany(s => s.Classes)
            //     .HasForeignKey(c => c.SubjectId);

            // modelBuilder.Entity<Class>()
            //     .HasOne(c => c.Teacher)
            //     .WithMany(t => t.Classes)
            //     .HasForeignKey(c => c.TeacherId);

            // // 11. Class <-> Student (N-N): 1 lớp học có nhiều sinh viên, 1 sinh viên có nhiều lớp học -> sinh ra bảng ClassStudent
            // // Ý nghĩa: Một lớp học (Class) có thể có nhiều sinh viên (Student), và một sinh viên có thể tham gia nhiều lớp học.
            // modelBuilder.Entity<ClassStudent>()
            //     .HasKey(cs => new { cs.ClassId, cs.StudentId });

            // modelBuilder.Entity<ClassStudent>()
            //     .HasOne(cs => cs.Class)
            //     .WithMany(c => c.ClassStudents)
            //     .HasForeignKey(cs => cs.ClassId);

            // modelBuilder.Entity<ClassStudent>()
            //     .HasOne(cs => cs.Student)
            //     .WithMany(s => s.ClassStudents)
            //     .HasForeignKey(cs => cs.StudentId);

            // // 12. Semester <-> Class (1-N): 1 kỳ có nhiều lớp học, 1 lớp học được dạy trong 1 kỳ cụ thể
            // // Ý nghĩa: Một học kỳ (Semester) có thể có nhiều lớp học (Class), nhưng mỗi lớp học chỉ diễn ra trong 1 học kỳ.
            // modelBuilder.Entity<Class>()
            //     .HasOne(c => c.Semester)
            //     .WithMany(s => s.Classes)
            //     .HasForeignKey(c => c.SemesterId);

            // // 13. Semester <-> PracticeExamPaper (1-N): 1 kỳ có nhiều đề kiểm tra, 1 đề kiểm tra được xác định bởi 1 kỳ
            // // Ý nghĩa: Một học kỳ (Semester) có thể có nhiều đề thi tự luận (PracticeExamPaper), nhưng mỗi đề thi tự luận chỉ thuộc về 1 học kỳ.
            // modelBuilder.Entity<PracticeExamPaper>()
            //     .HasOne(pep => pep.Semester)
            //     .WithMany(s => s.PracticeExamPapers)
            //     .HasForeignKey(pep => pep.SemesterId);

            // // 14. Semester <-> MultiQuestion (1-N): 1 kỳ có nhiều câu hỏi trắc nghiệm, 1 câu trắc nghiệm được xác định bởi 1 kỳ
            // // Ý nghĩa: Một học kỳ (Semester) có thể có nhiều câu hỏi trắc nghiệm (MultiQuestion), nhưng mỗi câu hỏi trắc nghiệm chỉ thuộc về 1 học kỳ.
            // modelBuilder.Entity<MultiQuestion>()
            //     .HasOne(mq => mq.Semester)
            //     .WithMany(s => s.MultiQuestions)
            //     .HasForeignKey(mq => mq.SemesterId);

            // // 15. Semester <-> PracticeQuestion (1-N): 1 kỳ có nhiều câu hỏi tự luận, 1 câu tự luận được xác định bởi 1 kỳ
            // // Ý nghĩa: Một học kỳ (Semester) có thể có nhiều câu hỏi tự luận (PracticeQuestion), nhưng mỗi câu hỏi tự luận chỉ thuộc về 1 học kỳ.
            // modelBuilder.Entity<PracticeQuestion>()
            //     .HasOne(pq => pq.Semester)
            //     .WithMany(s => s.PracticeQuestions)
            //     .HasForeignKey(pq => pq.SemesterId);

            // // 16. Semester <-> PracticeExam (1-N): 1 kỳ có nhiều bài thi tự luận, 1 bài thi tự luận nằm trong 1 kỳ cụ thể
            // // Ý nghĩa: Một học kỳ (Semester) có thể có nhiều kỳ thi tự luận (PracticeExam), nhưng mỗi kỳ thi tự luận chỉ diễn ra trong 1 học kỳ.
            // modelBuilder.Entity<PracticeExam>()
            //     .HasOne(pe => pe.Semester)
            //     .WithMany(s => s.PracticeExams)
            //     .HasForeignKey(pe => pe.SemesterId);

            // // 17. Room <-> ExamSlot (N-N): 1 phòng có nhiều ca thi, 1 ca thi có thể ở nhiều phòng -> sinh ra bảng ExamSlotRoom
            // // Ý nghĩa: Một phòng (Room) có thể được sử dụng cho nhiều ca thi (ExamSlot), và một ca thi có thể diễn ra ở nhiều phòng.
            // modelBuilder.Entity<ExamSlotRoom>()
            //     .HasOne(esr => esr.Room)
            //     .WithMany(r => r.ExamSlotRooms)
            //     .HasForeignKey(esr => esr.RoomId);

            // modelBuilder.Entity<ExamSlotRoom>()
            //     .HasOne(esr => esr.ExamSlot)
            //     .WithMany(es => es.ExamSlotRooms)
            //     .HasForeignKey(esr => esr.ExamSlotId);

            // // 18. Semester <-> ExamSlotRoom (1-N): 1 kỳ có nhiều ca thi đã có phòng, 1 phòng có ca thi chỉ trong 1 kỳ
            // // Ý nghĩa: Một học kỳ (Semester) có thể có nhiều phòng thi và ca thi (ExamSlotRoom), nhưng mỗi phòng/ca thi chỉ thuộc về 1 học kỳ.
            // modelBuilder.Entity<ExamSlotRoom>()
            //     .HasOne(esr => esr.Semester)
            //     .WithMany(s => s.ExamSlotRooms)
            //     .HasForeignKey(esr => esr.SemesterId);

            // // 19. MultiExam <-> MultiQuestion (N-N): 1 bài thi có nhiều câu hỏi, 1 câu hỏi có thể nằm trong nhiều bài thi -> sinh ra bảng FinalExam
            // // Ý nghĩa: Một kỳ thi trắc nghiệm (MultiExam) có thể có nhiều câu hỏi trắc nghiệm (MultiQuestion), và một câu hỏi trắc nghiệm có thể xuất hiện trong nhiều kỳ thi.
            // modelBuilder.Entity<FinalExam>()
            //     .HasKey(fe => new { fe.MultiExamId, fe.MultiQuestionId });

            // modelBuilder.Entity<FinalExam>()
            //     .HasOne(fe => fe.MultiExam)
            //     .WithMany(me => me.FinalExams)
            //     .HasForeignKey(fe => fe.MultiExamId);

            // modelBuilder.Entity<FinalExam>()
            //     .HasOne(fe => fe.MultiQuestion)
            //     .WithMany(mq => mq.FinalExams)
            //     .HasForeignKey(fe => fe.MultiQuestionId);

            // // 20. MultiExam <-> Student (N-N): 1 bài thi trắc nghiệm có nhiều sinh viên thi, 1 sinh viên có thể làm nhiều bài thi trắc nghiệm -> sinh ra bảng MultiExamHistory
            // // Ý nghĩa: Một kỳ thi trắc nghiệm (MultiExam) có thể có nhiều sinh viên (Student) tham gia, và một sinh viên có thể tham gia nhiều kỳ thi trắc nghiệm.
            // modelBuilder.Entity<MultiExamHistory>()
            //     .HasOne(meh => meh.MultiExam)
            //     .WithMany(me => me.MultiExamHistories)
            //     .HasForeignKey(meh => meh.MultiExamId);

            // modelBuilder.Entity<MultiExamHistory>()
            //     .HasOne(meh => meh.Student)
            //     .WithMany(s => s.MultiExamHistories)
            //     .HasForeignKey(meh => meh.StudentId);

            // // 21. MultiExamHistory <-> MultiQuestion (N-N): 1 lịch sử bài thi lưu lại nhiều câu hỏi trắc nghiệm, 1 câu hỏi trắc nghiệm nằm ở nhiều bài của mỗi sinh viên -> sinh ra QuestionMultiExam
            // // Ý nghĩa: Một lịch sử thi trắc nghiệm (MultiExamHistory) có thể chứa nhiều câu hỏi trắc nghiệm (MultiQuestion), và một câu hỏi trắc nghiệm có thể xuất hiện trong lịch sử thi của nhiều sinh viên.
            // modelBuilder.Entity<QuestionMultiExam>()
            //     .HasKey(qme => new { qme.MultiExamHistoryId, qme.MultiQuestionId });

            // modelBuilder.Entity<QuestionMultiExam>()
            //     .HasOne(qme => qme.MultiExamHistory)
            //     .WithMany(meh => meh.QuestionMultiExams)
            //     .HasForeignKey(qme => qme.MultiExamHistoryId);

            // modelBuilder.Entity<QuestionMultiExam>()
            //     .HasOne(qme => qme.MultiQuestion)
            //     .WithMany(mq => mq.QuestionMultiExams)
            //     .HasForeignKey(qme => qme.MultiQuestionId);

            // // 22. Teacher <-> ExamSlotRoom (1-N): 1 ca có phòng thi chỉ được 1 giáo viên trông thi/chấm điểm, 1 giáo viên có thể coi/chấm nhiều phòng có ca thi
            // // Ý nghĩa: Một phòng thi và ca thi (ExamSlotRoom) chỉ có 1 giáo viên trông thi (Supervisor) và 1 giáo viên chấm điểm (ExamGrader), nhưng 1 giáo viên có thể trông thi hoặc chấm điểm cho nhiều phòng/ca.
            // modelBuilder.Entity<ExamSlotRoom>()
            //     .HasOne(esr => esr.Supervisor)
            //     .WithOne(t => t.ExamSlotRoomSupervisor)
            //     .HasForeignKey<ExamSlotRoom>(esr => esr.SupervisorId);

            // modelBuilder.Entity<ExamSlotRoom>()
            //     .HasOne(esr => esr.ExamGrader)
            //     .WithOne(t => t.ExamSlotRoomGrader)
            //     .HasForeignKey<ExamSlotRoom>(esr => esr.ExamGradedId);

            // // 23. Student <-> PracticeExam (N-N): 1 học sinh có nhiều bài thi, 1 bài thi có nhiều sinh viên tham gia -> sinh ra bảng PracticeExamHistory
            // // Ý nghĩa: Một sinh viên (Student) có thể tham gia nhiều kỳ thi tự luận (PracticeExam), và một kỳ thi tự luận có thể có nhiều sinh viên tham gia.
            // modelBuilder.Entity<PracticeExamHistory>()
            //     .HasOne(peh => peh.Student)
            //     .WithMany(s => s.PracticeExamHistories)
            //     .HasForeignKey(peh => peh.StudentId);

            // modelBuilder.Entity<PracticeExamHistory>()
            //     .HasOne(peh => peh.PracticeExam)
            //     .WithMany(pe => pe.PracticeExamHistories)
            //     .HasForeignKey(peh => peh.PracExamId);

            // // 24. PracticeExamHistory <-> PracticeQuestion (N-N): 1 lịch sử bài thi tự luận có nhiều câu hỏi, 1 câu hỏi tự luận nằm trong nhiều lịch sử bài thi -> sinh ra QuestionPracExam
            // // Ý nghĩa: Một lịch sử thi tự luận (PracticeExamHistory) có thể chứa nhiều câu hỏi tự luận (PracticeQuestion), và một câu hỏi tự luận có thể xuất hiện trong lịch sử thi của nhiều sinh viên.
            // modelBuilder.Entity<QuestionPracExam>()
            //     .HasKey(qpe => new { qpe.PracExamHistoryId, qpe.PracticeQuestionId });

            // modelBuilder.Entity<QuestionPracExam>()
            //     .HasOne(qpe => qpe.PracticeExamHistory)
            //     .WithMany(peh => peh.QuestionPracExams)
            //     .HasForeignKey(qpe => qpe.PracExamHistoryId);

            // modelBuilder.Entity<QuestionPracExam>()
            //     .HasOne(qpe => qpe.PracticeQuestion)
            //     .WithMany(pq => pq.QuestionPracExams)
            //     .HasForeignKey(qpe => qpe.PracticeQuestionId);

            // // 25. PracticeQuestion <-> PracticeAnswer (1-1): 1 câu hỏi tự luận chỉ có 1 câu trả lời, 1 câu trả lời chỉ nằm trong 1 câu hỏi tự luận
            // // Ý nghĩa: Một câu hỏi tự luận (PracticeQuestion) chỉ có 1 đáp án (PracticeAnswer), và một đáp án chỉ thuộc về 1 câu hỏi tự luận.
            // modelBuilder.Entity<PracticeQuestion>()
            //     .HasOne(pq => pq.PracticeAnswer)
            //     .WithOne(pa => pa.PracticeQuestion)
            //     .HasForeignKey<PracticeAnswer>(pa => pa.PracticeQuestionId);

            // // 26. PracticeQuestion <-> PracticeExamPaper (N-N): 1 câu hỏi nằm trong nhiều đề thi, 1 đề thi có nhiều câu hỏi tự luận -> sinh ra PracticeTestQuestion
            // // Ý nghĩa: Một câu hỏi tự luận (PracticeQuestion) có thể xuất hiện trong nhiều đề thi tự luận (PracticeExamPaper), và một đề thi tự luận có thể có nhiều câu hỏi.
            // modelBuilder.Entity<PracticeTestQuestion>()
            //     .HasKey(ptq => new { ptq.PracExamPaperId, ptq.PracticeQuestionId });

            // modelBuilder.Entity<PracticeTestQuestion>()
            //     .HasOne(ptq => ptq.PracticeExamPaper)
            //     .WithMany(pep => pep.PracticeTestQuestions)
            //     .HasForeignKey(ptq => ptq.PracExamPaperId);

            // modelBuilder.Entity<PracticeTestQuestion>()
            //     .HasOne(ptq => ptq.PracticeQuestion)
            //     .WithMany(pq => pq.PracticeTestQuestions)
            //     .HasForeignKey(ptq => ptq.PracticeQuestionId);

            // // 27. PracticeExamPaper <-> PracticeExam (N-N): 1 đề thi có thể nằm trong nhiều bài thi, 1 bài thi có nhiều đề thi -> sinh ra bảng NoPEPaperInPE
            // // Ý nghĩa: Một đề thi tự luận (PracticeExamPaper) có thể được sử dụng trong nhiều kỳ thi tự luận (PracticeExam), và một kỳ thi tự luận có thể sử dụng nhiều đề thi.
            // modelBuilder.Entity<NoPEPaperInPE>()
            //     .HasKey(np => new { np.PracExamId, np.PracExamPaperId });

            // modelBuilder.Entity<NoPEPaperInPE>()
            //     .HasOne(np => np.PracticeExam)
            //     .WithMany(pe => pe.NoPEPaperInPEs)
            //     .HasForeignKey(np => np.PracExamId);

            // modelBuilder.Entity<NoPEPaperInPE>()
            //     .HasOne(np => np.PracticeExamPaper)
            //     .WithMany(pep => pep.NoPEPaperInPEs)
            //     .HasForeignKey(np => np.PracExamPaperId);

            // // 28. LevelQuestion <-> PracticeQuestion (1-N): 1 level có nhiều câu tự luận, 1 câu hỏi tự luận chỉ có 1 level
            // // Ý nghĩa: Một cấp độ câu hỏi (LevelQuestion) có thể có nhiều câu hỏi tự luận (PracticeQuestion), nhưng mỗi câu hỏi tự luận chỉ thuộc về 1 cấp độ.
            // modelBuilder.Entity<PracticeQuestion>()
            //     .HasOne(pq => pq.LevelQuestion)
            //     .WithMany(lq => lq.PracticeQuestions)
            //     .HasForeignKey(pq => pq.LevelQuestionId);

            // // 29. LevelQuestion <-> MultiQuestion (1-N): 1 level có nhiều câu trắc nghiệm, 1 câu hỏi trắc nghiệm chỉ có 1 level
            // // Ý nghĩa: Một cấp độ câu hỏi (LevelQuestion) có thể có nhiều câu hỏi trắc nghiệm (MultiQuestion), nhưng mỗi câu hỏi trắc nghiệm chỉ thuộc về 1 cấp độ.
            // modelBuilder.Entity<MultiQuestion>()
            //     .HasOne(mq => mq.LevelQuestion)
            //     .WithMany(lq => lq.MultiQuestions)
            //     .HasForeignKey(mq => mq.LevelQuestionId);

            // // 30. MultiQuestion <-> MultiAnswer (1-N): 1 câu hỏi trắc nghiệm có nhiều câu trả lời, 1 câu trả lời chỉ nằm ở 1 câu hỏi
            // // Ý nghĩa: Một câu hỏi trắc nghiệm (MultiQuestion) có thể có nhiều đáp án (MultiAnswer), nhưng mỗi đáp án chỉ thuộc về 1 câu hỏi trắc nghiệm.
            // modelBuilder.Entity<MultiAnswer>()
            //     .HasOne(ma => ma.MultiQuestion)
            //     .WithMany(mq => mq.MultiAnswers)
            //     .HasForeignKey(ma => ma.MultiQuestionId);

            // // 31. Cohort <-> TrainingProgram (N-N): 1 khóa được nhiều chương trình áp dụng, 1 chương trình đào tạo chỉ áp dụng vào 1 niên khóa -> sinh ra ApplyTrainingProgram
            // // Ý nghĩa: Một niên khóa (Cohort) có thể áp dụng nhiều chương trình đào tạo (TrainingProgram), và một chương trình đào tạo có thể được áp dụng cho nhiều niên khóa.
            // modelBuilder.Entity<ApplyTrainingProgram>()
            //     .HasKey(atp => new { atp.TrainProId, atp.CohortId });

            // modelBuilder.Entity<ApplyTrainingProgram>()
            //     .HasOne(atp => atp.TrainingProgram)
            //     .WithMany(tp => tp.ApplyTrainingPrograms)
            //     .HasForeignKey(atp => atp.TrainProId);

            // modelBuilder.Entity<ApplyTrainingProgram>()
            //     .HasOne(atp => atp.Cohort)
            //     .WithMany(c => c.ApplyTrainingPrograms)
            //     .HasForeignKey(atp => atp.CohortId);

            // // 32. Cohort <-> Student (1-N): 1 niên khóa có nhiều sinh viên, 1 sinh viên chỉ ở 1 niên khóa
            // // Ý nghĩa: Một niên khóa (Cohort) có thể có nhiều sinh viên (Student), nhưng mỗi sinh viên chỉ thuộc về 1 niên khóa.
            // modelBuilder.Entity<Student>()
            //     .HasOne(s => s.Cohort)
            //     .WithMany(c => c.Students)
            //     .HasForeignKey(s => s.CohortId);

            // // 33. ExamSlotRoom <-> PracticeExam (N-1): 1 phòng có ca thi chỉ có 1 bài thi tự luận, 1 bài thi tự luận có thể nằm ở nhiều phòng trong cùng 1 ca thi
            // // Ý nghĩa: Một phòng thi và ca thi (ExamSlotRoom) chỉ tổ chức 1 kỳ thi tự luận (PracticeExam), nhưng một kỳ thi tự luận có thể diễn ra ở nhiều phòng/ca khác nhau.
            // modelBuilder.Entity<ExamSlotRoom>()
            //     .HasOne(esr => esr.PracticeExam)
            //     .WithOne(pe => pe.ExamSlotRoom)
            //     .HasForeignKey<ExamSlotRoom>(esr => esr.ExamId);

            // // 34. ExamSlotRoom <-> MultiExam (N-1): 1 phòng có ca thi chỉ có 1 bài thi trắc nghiệm, 1 bài thi trắc nghiệm có thể nằm ở nhiều phòng trong cùng 1 ca thi
            // // Ý nghĩa: Một phòng thi và ca thi (ExamSlotRoom) chỉ tổ chức 1 kỳ thi trắc nghiệm (MultiExam), nhưng một kỳ thi trắc nghiệm có thể diễn ra ở nhiều phòng/ca khác nhau.
            // modelBuilder.Entity<ExamSlotRoom>()
            //     .HasOne(esr => esr.MultiExam)
            //     .WithOne(me => me.ExamSlotRoom)
            //     .HasForeignKey<ExamSlotRoom>(esr => esr.ExamId);

            // // 35. Semester <-> MultiExam (1-N): 1 kỳ học có nhiều bài thi trắc nghiệm, 1 bài thi trắc nghiệm chỉ nằm trong 1 kỳ
            // // Ý nghĩa: Một học kỳ (Semester) có thể có nhiều kỳ thi trắc nghiệm (MultiExam), nhưng mỗi kỳ thi trắc nghiệm chỉ thuộc về 1 học kỳ.
            // modelBuilder.Entity<MultiExam>()
            //     .HasOne(me => me.Semester)
            //     .WithMany(s => s.MultiExams)
            //     .HasForeignKey(me => me.SemesterId);

            // // 36. CategoryExam <-> MultiQuestion (1-N): 1 thể loại bài thi có nhiều câu hỏi, 1 câu hỏi chỉ nằm trong 1 loại bài thi
            // // Ý nghĩa: Một danh mục kỳ thi (CategoryExam) có thể có nhiều câu hỏi trắc nghiệm (MultiQuestion), nhưng mỗi câu hỏi trắc nghiệm chỉ thuộc về 1 danh mục kỳ thi.
            // modelBuilder.Entity<MultiQuestion>()
            //     .HasOne(mq => mq.CategoryExam)
            //     .WithMany(ce => ce.MultiQuestions)
            //     .HasForeignKey(mq => mq.CategoryExamId);

            // // 37. CategoryExam <-> MultiExam (1-N): 1 loại bài thi có nhiều bài thi trắc nghiệm, 1 bài trắc nghiệm chỉ nằm trong 1 loại bài thi
            // // Ý nghĩa: Một danh mục kỳ thi (CategoryExam) có thể có nhiều kỳ thi trắc nghiệm (MultiExam), nhưng mỗi kỳ thi trắc nghiệm chỉ thuộc về 1 danh mục kỳ thi.
            // modelBuilder.Entity<MultiExam>()
            //     .HasOne(me => me.CategoryExam)
            //     .WithMany(ce => ce.MultiExams)
            //     .HasForeignKey(me => me.CategoryExamId);

            // // 38. CategoryExam <-> PracticeExam (1-N): 1 loại bài thi có nhiều bài thi tự luận, 1 bài tự luận chỉ nằm trong 1 loại bài thi
            // // Ý nghĩa: Một danh mục kỳ thi (CategoryExam) có thể có nhiều kỳ thi tự luận (PracticeExam), nhưng mỗi kỳ thi tự luận chỉ thuộc về 1 danh mục kỳ thi.
            // modelBuilder.Entity<PracticeExam>()
            //     .HasOne(pe => pe.CategoryExam)
            //     .WithMany(ce => ce.PracticeExams)
            //     .HasForeignKey(pe => pe.CategoryExamId);

            // // 39. Chapter <-> PracticeQuestion (1-N): 1 chapter có nhiều câu hỏi tự luận, 1 câu hỏi tự luận chỉ nằm trong 1 chapter
            // // Ý nghĩa: Một chương (Chapter) có thể chứa nhiều câu hỏi tự luận (PracticeQuestion), nhưng mỗi câu hỏi tự luận chỉ thuộc về 1 chương.
            // modelBuilder.Entity<PracticeQuestion>()
            //     .HasOne(pq => pq.Chapter)
            //     .WithMany(c => c.PracticeQuestions)
            //     .HasForeignKey(pq => pq.ChapterId);

            // // 40. CategoryExam <-> PracticeExamPaper (1-N): 1 loại bài thi có nhiều đề thi, 1 đề thi chỉ trong 1 loại bài thi
            // // Ý nghĩa: Một danh mục kỳ thi (CategoryExam) có thể có nhiều đề thi tự luận (PracticeExamPaper), nhưng mỗi đề thi tự luận chỉ thuộc về 1 danh mục kỳ thi.
            // modelBuilder.Entity<PracticeExamPaper>()
            //     .HasOne(pep => pep.CategoryExam)
            //     .WithMany(ce => ce.PracticeExamPapers)
            //     .HasForeignKey(pep => pep.CategoryExamId);

            // // 41. Subject <-> PracticeExam (1-N): 1 môn học có nhiều bài thi, 1 bài thi cụ thể nằm trong 1 môn học
            // // Ý nghĩa: Một môn học (Subject) có thể có nhiều kỳ thi tự luận (PracticeExam), nhưng mỗi kỳ thi tự luận chỉ thuộc về 1 môn học.
            // modelBuilder.Entity<PracticeExam>()
            //     .HasOne(pe => pe.Subject)
            //     .WithMany(s => s.PracticeExams)
            //     .HasForeignKey(pe => pe.SubjectId);

            // // 42. Subject <-> PracticeExamPaper (1-N): 1 môn học có nhiều đề thi, 1 đề thi nằm trong 1 môn học
            // // Ý nghĩa: Một môn học (Subject) có thể có nhiều đề thi tự luận (PracticeExamPaper), nhưng mỗi đề thi tự luận chỉ thuộc về 1 môn học.
            // modelBuilder.Entity<PracticeExamPaper>()
            //     .HasOne(pep => pep.Subject)
            //     .WithMany(s => s.PracticeExamPapers)
            //     .HasForeignKey(pep => pep.SubjectId);

            // // 43. Subject <-> ExamSlotRoom (1-N): 1 môn học có nhiều ca thi và phòng thi, 1 ca và phòng chỉ có bài thi của 1 môn
            // // Ý nghĩa: Một môn học (Subject) có thể được tổ chức thi ở nhiều phòng thi và ca thi (ExamSlotRoom), nhưng mỗi phòng/ca thi chỉ tổ chức thi cho 1 môn học.
            // modelBuilder.Entity<ExamSlotRoom>()
            //     .HasOne(esr => esr.Subject)
            //     .WithOne(s => s.ExamSlotRoom)
            //     .HasForeignKey<ExamSlotRoom>(esr => esr.SubjectId);
        }
    }
}