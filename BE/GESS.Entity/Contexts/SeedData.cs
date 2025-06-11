using GESS.Entity.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Entity.Contexts
{
    public static class SeedData
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            // Lấy các service cần thiết
            using var scope = serviceProvider.CreateScope();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
            var context = scope.ServiceProvider.GetRequiredService<GessDbContext>();

            // Tạo các role
            await SeedRolesAsync(roleManager);

            // Tạo users và gán role
            await SeedUsersAsync(userManager);

            // Tạo dữ liệu mẫu cho các bảng khác
            await SeedMajorsAsync(context);
            await SeedTrainingProgramsAsync(context);
            await SeedSubjectsAsync(context);
            await SeedChaptersAsync(context);
            await SeedQuestionsAsync(context);
            await SeedRoomsAsync(context);
            await SeedSemestersAsync(context);
            await SeedCohortsAsync(context);
            await SeedClassesAsync(context);
            await SeedLevelQuestionsAsync(context);
            await SeedPracticeExamsAsync(context);
            await SeedPracticeExamPapersAsync(context);
            await SeedPracticeAnswersAsync(context);
            await SeedQuestionPracExamsAsync(context);
            await SeedPracticeTestQuestionsAsync(context);
            await SeedNoPEPaperInPEsAsync(context);
            await SeedApplyTrainingProgramsAsync(context);
            await SeedSubjectTrainingProgramsAsync(context);
            await SeedCategoryExamSubjectsAsync(context);
            await SeedPreconditionSubjectsAsync(context);
            await SeedNoQuestionInChaptersAsync(context);
            await SeedFinalExamsAsync(context);
            await SeedMultiExamHistoriesAsync(context);
            await SeedMajorTeachersAsync(context);
            await SeedClassStudentsAsync(context);
            await SeedCategoryExamsAsync(context);
            await SeedMultiExamsAsync(context);
            await SeedMultiAnswersAsync(context);
            await SeedQuestionMultiExamsAsync(context);
            await SeedExamSlotsAsync(context);
            await SeedExamSlotRoomsAsync(context);
        }

        private static async Task SeedRolesAsync(RoleManager<IdentityRole<Guid>> roleManager)
        {
            string[] roles = new[] { "Teacher", "Admin", "Student" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    var roleResult = await roleManager.CreateAsync(new IdentityRole<Guid>
                    {
                        Id = Guid.NewGuid(),
                        Name = role,
                        NormalizedName = role.ToUpper()
                    });

                    if (!roleResult.Succeeded)
                    {
                        throw new Exception($"Failed to create role {role}: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
                    }
                }
            }
        }

        private static async Task SeedUsersAsync(UserManager<User> userManager)
        {
            await CreateUser(userManager, "admin@example.com", "Admin User", "Admin", "Password123!", new DateTime(1980, 1, 1), "1234567890", true, "Admin");
            await CreateUser(userManager, "teacher1@example.com", "Teacher One", "Teacher", "Password123!", new DateTime(1985, 5, 10), "0987654321", false, "Teacher");
            await CreateUser(userManager, "student1@example.com", "Student One", "Student", "Password123!", new DateTime(2000, 8, 15), "0123456789", true, "Student");
            await CreateUser(userManager, "lekienhg2003@gmail.com", "Student One", "Student", "Abc123!@", new DateTime(2000, 8, 15), "0123456789", true, "Student");
        }

        private static async Task SeedMajorsAsync(GessDbContext context)
        {
            if (!context.Majors.Any())
            {
                var majors = new List<Major>
                {
                    new Major 
                    { 
                        MajorName = "Công nghệ thông tin",
                        StartDate = new DateTime(2023, 9, 1),
                        IsActive = true
                    },
                    new Major 
                    { 
                        MajorName = "Kỹ thuật điện",
                        StartDate = new DateTime(2023, 9, 1),
                        IsActive = true
                    },
                    new Major 
                    { 
                        MajorName = "Cơ khí",
                        StartDate = new DateTime(2023, 9, 1),
                        IsActive = true
                    }
                };
                await context.Majors.AddRangeAsync(majors);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedTrainingProgramsAsync(GessDbContext context)
        {
            if (!context.TrainingPrograms.Any())
            {
                var programs = new List<TrainingProgram>
                {
                    new TrainingProgram 
                    { 
                        TrainProName = "Chương trình CNTT 2023",
                        StartDate = new DateTime(2023, 9, 1),
                        EndDate = new DateTime(2027, 6, 30),
                        NoCredits = 150,
                        MajorId = 1 // Liên kết với ngành CNTT
                    },
                    new TrainingProgram 
                    { 
                        TrainProName = "Chương trình Điện 2023",
                        StartDate = new DateTime(2023, 9, 1),
                        EndDate = new DateTime(2027, 6, 30),
                        NoCredits = 150,
                        MajorId = 2 // Liên kết với ngành Điện
                    }
                };
                await context.TrainingPrograms.AddRangeAsync(programs);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedSubjectsAsync(GessDbContext context)
        {
            if (!context.Subjects.Any())
            {
                var subjects = new List<Subject>
                {
                    new Subject 
                    { 
                        SubjectName = "Lập trình C#",
                        Description = "Môn học về lập trình C#",
                        Course = "CS101",
                        NoCredits = 3
                    },
                    new Subject 
                    { 
                        SubjectName = "Cơ sở dữ liệu",
                        Description = "Môn học về cơ sở dữ liệu",
                        Course = "CS102",
                        NoCredits = 3
                    },
                    new Subject 
                    { 
                        SubjectName = "Mạng máy tính",
                        Description = "Môn học về mạng máy tính",
                        Course = "CS103",
                        NoCredits = 3
                    }
                };
                await context.Subjects.AddRangeAsync(subjects);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedChaptersAsync(GessDbContext context)
        {
            if (!context.Chapters.Any())
            {
                var chapters = new List<Chapter>
                {
                    new Chapter 
                    { 
                        ChapterName = "Chương 1: Giới thiệu C#",
                        Description = "Chương mở đầu về C#",
                        SubjectId = 1 // Liên kết với môn Lập trình C#
                    },
                    new Chapter 
                    { 
                        ChapterName = "Chương 2: Cú pháp cơ bản",
                        Description = "Chương về cú pháp cơ bản C#",
                        SubjectId = 1 // Liên kết với môn Lập trình C#
                    }
                };
                await context.Chapters.AddRangeAsync(chapters);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedQuestionsAsync(GessDbContext context)
        {
            if (!context.MultiQuestions.Any())
            {
                var multiQuestions = new List<MultiQuestion>
                {
                    new MultiQuestion
                    {
                        Content = "C# là ngôn ngữ lập trình gì?",
                        IsActive = true,
                        CreatedBy = "admin",
                        IsPublic = true,
                        ChapterId = 1 // Liên kết với Chương 1
                    }
                };
                await context.MultiQuestions.AddRangeAsync(multiQuestions);
                await context.SaveChangesAsync();
            }

            if (!context.PracticeQuestions.Any())
            {
                var practiceQuestions = new List<PracticeQuestion>
                {
                    new PracticeQuestion
                    {
                        Content = "Viết chương trình Hello World bằng C#",
                        IsActive = true,
                        CreatedBy = "admin",
                        IsPublic = true,
                        ChapterId = 1, // Liên kết với Chương 1
                        CategoryExamId = 1, // Liên kết với CategoryExam
                        LevelQuestionId = 1, // Liên kết với LevelQuestion
                        SemesterId = 1 // Liên kết với Semester
                    }
                };
                await context.PracticeQuestions.AddRangeAsync(practiceQuestions);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedRoomsAsync(GessDbContext context)
        {
            if (!context.Rooms.Any())
            {
                var rooms = new List<Room>
                {
                    new Room 
                    { 
                        RoomName = "Phòng 101",
                        Description = "Phòng học CNTT",
                        Status = "Available",
                        Capacity = 30
                    },
                    new Room 
                    { 
                        RoomName = "Phòng 102",
                        Description = "Phòng học CNTT",
                        Status = "Available",
                        Capacity = 40
                    },
                    new Room 
                    { 
                        RoomName = "Phòng 103",
                        Description = "Phòng học CNTT",
                        Status = "Available",
                        Capacity = 35
                    }
                };
                await context.Rooms.AddRangeAsync(rooms);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedSemestersAsync(GessDbContext context)
        {
            if (!context.Semesters.Any())
            {
                var semesters = new List<Semester>
                {
                    new Semester 
                    { 
                        SemesterName = "Học kỳ 1 - 2023",
                        StartDate = new DateTime(2023, 9, 1),
                        EndDate = new DateTime(2024, 1, 15)
                    },
                    new Semester 
                    { 
                        SemesterName = "Học kỳ 2 - 2023",
                        StartDate = new DateTime(2024, 2, 1),
                        EndDate = new DateTime(2024, 6, 15)
                    }
                };
                await context.Semesters.AddRangeAsync(semesters);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedCohortsAsync(GessDbContext context)
        {
            if (!context.Cohorts.Any())
            {
                var cohorts = new List<Cohort>
                {
                    new Cohort 
                    { 
                        CohortName = "K23"
                    },
                    new Cohort 
                    { 
                        CohortName = "K24"
                    }
                };
                await context.Cohorts.AddRangeAsync(cohorts);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedClassesAsync(GessDbContext context)
        {
            if (!context.Classes.Any())
            {
                var classes = new List<Class>
                {
                    new Class 
                    { 
                        ClassName = "SE1601",
                        TeacherId = Guid.Parse("00000000-0000-0000-0000-000000000001"), // ID của teacher1
                        SubjectId = 1, // Liên kết với môn Lập trình C#
                        SemesterId = 1 // Liên kết với Học kỳ 1
                    },
                    new Class 
                    { 
                        ClassName = "SE1602",
                        TeacherId = Guid.Parse("00000000-0000-0000-0000-000000000001"), // ID của teacher1
                        SubjectId = 2, // Liên kết với môn Cơ sở dữ liệu
                        SemesterId = 1 // Liên kết với Học kỳ 1
                    }
                };
                await context.Classes.AddRangeAsync(classes);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedLevelQuestionsAsync(GessDbContext context)
        {
            if (!context.LevelQuestions.Any())
            {
                var levels = new List<LevelQuestion>
                {
                    new LevelQuestion { LevelQuestionName = "Dễ" },
                    new LevelQuestion { LevelQuestionName = "Trung bình" },
                    new LevelQuestion { LevelQuestionName = "Khó" }
                };
                await context.LevelQuestions.AddRangeAsync(levels);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedPracticeExamsAsync(GessDbContext context)
        {
            if (!context.PracticeExams.Any())
            {
                var exams = new List<PracticeExam>
                {
                    new PracticeExam
                    {
                        PracExamName = "Kiểm tra giữa kỳ C#",
                        Duration = 60,
                        CreateAt = DateTime.Now,
                        Status = "Draft",
                        CodeStart = "CS101-MID",
                        CreateBy = "admin",
                        SubjectId = 1,
                        CategoryExamId = 1,
                        SemesterId = 1
                    }
                };
                await context.PracticeExams.AddRangeAsync(exams);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedPracticeExamPapersAsync(GessDbContext context)
        {
            if (!context.PracticeExamPapers.Any())
            {
                var papers = new List<PracticeExamPaper>
                {
                    new PracticeExamPaper
                    {
                        PracExamPaperName = "Đề thi giữa kỳ C# - Đề 1",
                        NumberQuestion = 5,
                        CreateAt = DateTime.Now,
                        Status = "Draft",
                        CreateBy = "admin",
                        CategoryExamId = 1,
                        SubjectId = 1,
                        SemesterId = 1
                    }
                };
                await context.PracticeExamPapers.AddRangeAsync(papers);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedPracticeAnswersAsync(GessDbContext context)
        {
            if (!context.PracticeAnswers.Any())
            {
                var answers = new List<PracticeAnswer>
                {
                    new PracticeAnswer
                    {
                        AnswerContent = "Console.WriteLine(\"Hello World\");",
                        PracticeQuestionId = 1
                    }
                };
                await context.PracticeAnswers.AddRangeAsync(answers);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedQuestionPracExamsAsync(GessDbContext context)
        {
            if (!context.QuestionPracExams.Any())
            {
                var questionExams = new List<QuestionPracExam>
                {
                    new QuestionPracExam
                    {
                        PracExamHistoryId = Guid.NewGuid(),
                        PracticeQuestionId = 1,
                        Answer = "Console.WriteLine(\"Hello World\");",
                        Score = 10
                    }
                };
                await context.QuestionPracExams.AddRangeAsync(questionExams);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedPracticeTestQuestionsAsync(GessDbContext context)
        {
            if (!context.PracticeTestQuestions.Any())
            {
                var testQuestions = new List<PracticeTestQuestion>
                {
                    new PracticeTestQuestion
                    {
                        PracExamPaperId = 1,
                        PracticeQuestionId = 1,
                        QuestionOrder = 1,
                        Score = 10
                    }
                };
                await context.PracticeTestQuestions.AddRangeAsync(testQuestions);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedNoPEPaperInPEsAsync(GessDbContext context)
        {
            if (!context.NoPEPaperInPEs.Any())
            {
                var papers = new List<NoPEPaperInPE>
                {
                    new NoPEPaperInPE
                    {
                        PracExamId = 1,
                        PracExamPaperId = 1
                    }
                };
                await context.NoPEPaperInPEs.AddRangeAsync(papers);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedApplyTrainingProgramsAsync(GessDbContext context)
        {
            if (!context.ApplyTrainingPrograms.Any())
            {
                var programs = new List<ApplyTrainingProgram>
                {
                    new ApplyTrainingProgram
                    {
                        TrainProId = 1,
                        CohortId = 1
                    }
                };
                await context.ApplyTrainingPrograms.AddRangeAsync(programs);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedSubjectTrainingProgramsAsync(GessDbContext context)
        {
            if (!context.SubjectTrainingPrograms.Any())
            {
                var programs = new List<SubjectTrainingProgram>
                {
                    new SubjectTrainingProgram
                    {
                        SubjectId = 1,
                        TrainProId = 1
                    }
                };
                await context.SubjectTrainingPrograms.AddRangeAsync(programs);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedCategoryExamSubjectsAsync(GessDbContext context)
        {
            if (!context.CategoryExamSubjects.Any())
            {
                var subjects = new List<CategoryExamSubject>
                {
                    new CategoryExamSubject
                    {
                        CategoryExamId = 1,
                        SubjectId = 1
                    }
                };
                await context.CategoryExamSubjects.AddRangeAsync(subjects);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedPreconditionSubjectsAsync(GessDbContext context)
        {
            if (!context.PreconditionSubjects.Any())
            {
                var preconditions = new List<PreconditionSubject>
                {
                    new PreconditionSubject
                    {
                        SubTrainingProgramId = 1,
                        PreconditionSubjectId = 2
                    }
                };
                await context.PreconditionSubjects.AddRangeAsync(preconditions);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedNoQuestionInChaptersAsync(GessDbContext context)
        {
            if (!context.NoQuestionInChapters.Any())
            {
                var chapters = new List<NoQuestionInChapter>
                {
                    new NoQuestionInChapter
                    {
                        MultiExamId = 1,
                        ChapterId = 1,
                        NumberQuestion = 5
                    }
                };
                await context.NoQuestionInChapters.AddRangeAsync(chapters);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedFinalExamsAsync(GessDbContext context)
        {
            if (!context.FinalExams.Any())
            {
                var finalExams = new List<FinalExam>
                {
                    new FinalExam
                    {
                        MultiExamId = 1,
                        MultiQuestionId = 1
                    }
                };
                await context.FinalExams.AddRangeAsync(finalExams);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedMultiExamHistoriesAsync(GessDbContext context)
        {
            if (!context.MultiExamHistories.Any())
            {
                var histories = new List<MultiExamHistory>
                {
                    new MultiExamHistory
                    {
                        ExamHistoryId = Guid.NewGuid(),
                        StartTime = DateTime.Now,
                        EndTime = DateTime.Now.AddHours(1),
                        Score = 8.5,
                        CheckIn = true,
                        StatusExam = "Completed",
                        IsGrade = true,
                        ExamSlotRoomId = 1,
                        StudentId = Guid.Parse("00000000-0000-0000-0000-000000000001"), // ID của student1
                        MultiExamId = 1
                    }
                };
                await context.MultiExamHistories.AddRangeAsync(histories);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedMajorTeachersAsync(GessDbContext context)
        {
            if (!context.MajorTeachers.Any())
            {
                var teachers = new List<MajorTeacher>
                {
                    new MajorTeacher
                    {
                        MajorId = 1,
                        TeacherId = Guid.Parse("00000000-0000-0000-0000-000000000001") // ID của teacher1
                    }
                };
                await context.MajorTeachers.AddRangeAsync(teachers);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedClassStudentsAsync(GessDbContext context)
        {
            if (!context.ClassStudents.Any())
            {
                var students = new List<ClassStudent>
                {
                    new ClassStudent
                    {
                        ClassId = 1,
                        StudentId = Guid.Parse("00000000-0000-0000-0000-000000000003") // ID của student1
                    }
                };
                await context.ClassStudents.AddRangeAsync(students);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedCategoryExamsAsync(GessDbContext context)
        {
            if (!context.CategoryExams.Any())
            {
                var categories = new List<CategoryExam>
                {
                    new CategoryExam
                    {
                        CategoryExamName = "Kiểm tra giữa kỳ"
                    },
                    new CategoryExam
                    {
                        CategoryExamName = "Kiểm tra cuối kỳ"
                    }
                };
                await context.CategoryExams.AddRangeAsync(categories);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedMultiExamsAsync(GessDbContext context)
        {
            if (!context.MultiExams.Any())
            {
                var exams = new List<MultiExam>
                {
                    new MultiExam
                    {
                        MultiExamName = "Kiểm tra giữa kỳ C#",
                        Duration = 60,
                        CreateAt = DateTime.Now,
                        Status = "Draft",
                        CodeStart = "CS101-MID",
                        CreateBy = "admin",
                        SubjectId = 1,
                        CategoryExamId = 1,
                        SemesterId = 1,
                        IsPublish = false
                    }
                };
                await context.MultiExams.AddRangeAsync(exams);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedMultiAnswersAsync(GessDbContext context)
        {
            if (!context.MultiAnswers.Any())
            {
                var answers = new List<MultiAnswer>
                {
                    new MultiAnswer
                    {
                        AnswerContent = "Ngôn ngữ lập trình hướng đối tượng",
                        IsCorrect = true,
                        MultiQuestionId = 1
                    },
                    new MultiAnswer
                    {
                        AnswerContent = "Ngôn ngữ lập trình thủ tục",
                        IsCorrect = false,
                        MultiQuestionId = 1
                    },
                    new MultiAnswer
                    {
                        AnswerContent = "Ngôn ngữ đánh dấu",
                        IsCorrect = false,
                        MultiQuestionId = 1
                    },
                    new MultiAnswer
                    {
                        AnswerContent = "Ngôn ngữ truy vấn",
                        IsCorrect = false,
                        MultiQuestionId = 1
                    }
                };
                await context.MultiAnswers.AddRangeAsync(answers);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedQuestionMultiExamsAsync(GessDbContext context)
        {
            if (!context.QuestionMultiExams.Any())
            {
                var questionExams = new List<QuestionMultiExam>
                {
                    new QuestionMultiExam
                    {
                        MultiExamHistoryId = Guid.NewGuid(),
                        MultiQuestionId = 1,
                        Score = 10
                    }
                };
                await context.QuestionMultiExams.AddRangeAsync(questionExams);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedExamSlotsAsync(GessDbContext context)
        {
            if (!context.ExamSlots.Any())
            {
                var slots = new List<ExamSlot>
                {
                    new ExamSlot
                    {
                        SlotName = "Ca 1",
                        StartTime = new DateTime(2024, 1, 15, 7, 0, 0),
                        EndTime = new DateTime(2024, 1, 15, 9, 0, 0)
                    },
                    new ExamSlot
                    {
                        SlotName = "Ca 2",
                        StartTime = new DateTime(2024, 1, 15, 9, 30, 0),
                        EndTime = new DateTime(2024, 1, 15, 11, 30, 0)
                    }
                };
                await context.ExamSlots.AddRangeAsync(slots);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedExamSlotRoomsAsync(GessDbContext context)
        {
            if (!context.ExamSlotRooms.Any())
            {
                var slotRooms = new List<ExamSlotRoom>
                {
                    new ExamSlotRoom
                    {
                        ExamSlotId = 1,
                        RoomId = 1,
                        SubjectId = 1,
                        SemesterId = 1,
                        SupervisorId = Guid.Parse("00000000-0000-0000-0000-000000000001"), // ID của teacher1
                        ExamGradedId = Guid.Parse("00000000-0000-0000-0000-000000000001") // ID của teacher1
                    }
                };
                await context.ExamSlotRooms.AddRangeAsync(slotRooms);
                await context.SaveChangesAsync();
            }
        }

        private static async Task CreateUser(
            UserManager<User> userManager,
            string email,
            string firstName,
            string lastName,
            string password,
            DateTime dateOfBirth,
            string phoneNumber,
            bool gender,
            string role)
        {
            var user = await userManager.FindByEmailAsync(email);
            if (user == null)
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    UserName = email,
                    Email = email,
                    FirstName = firstName,
                    LastName = lastName,
                    DateOfBirth = dateOfBirth,
                    PhoneNumber = phoneNumber,
                    Gender = gender,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(user, password);
                if (!result.Succeeded)
                {
                    throw new Exception($"Failed to create user {email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }

                var roleResult = await userManager.AddToRoleAsync(user, role);
                if (!roleResult.Succeeded)
                {
                    throw new Exception($"Failed to assign role {role} to user {email}: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
                }
            }
        }
    }
}
