using GESS.Common;
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
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<GessDbContext>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

            try
            {
                // 1. Tạo dữ liệu cơ bản không phụ thuộc
                await SeedRolesAsync(roleManager);
                await SeedUsersAsync(userManager);
                await SeedMajorsAsync(context);
                await SeedSemestersAsync(context);
                await SeedCohortsAsync(context);

                // 2. Tạo dữ liệu CategoryExam và Subject (cần thiết cho nhiều bảng khác)
                await SeedCategoryExamDataAsync(context);

                // 3. Tạo dữ liệu phụ thuộc vào User và Major
                await SeedTeachersAsync(context);
                await SeedStudentsAsync(context);

                // 4. Tạo dữ liệu phụ thuộc vào Subject và Teacher
                await SeedChaptersAsync(context);
                await SeedClassesAsync(context);

                // 5. Tạo dữ liệu phụ thuộc vào Class và Student
                await SeedClassStudentsAsync(context);

                // 6. Tạo dữ liệu cho phần thi tự luận (phụ thuộc vào CategoryExam, Subject, Chapter)
                await SeedPracticeExamDataAsync(context);

                // 7. Tạo dữ liệu cho phần thi trắc nghiệm (phụ thuộc vào ExamSlot, ExamSlotRoom, FinalExam, PracticeTestQuestion, NoQuestionInChapter, NoPEPaperInPE)
                await SeedExamSlotsAsync(context);
                await SeedExamSlotRoomsAsync(context);
                await SeedFinalExamsAsync(context);
                await SeedPracticeTestQuestionsAsync(context);
                await SeedNoQuestionInChaptersAsync(context);
                await SeedNoPEPaperInPEsAsync(context);

                // 8. Tạo dữ liệu ApplyTrainingProgram
                await SeedApplyTrainingProgramsAsync(context);

                // 9. Tạo dữ liệu phụ thuộc vào Room
                await SeedRoomsAsync(context);

                // 10. Tạo dữ liệu phụ thuộc vào LevelQuestion
                await SeedLevelQuestionsAsync(context);

                // 11. Tạo dữ liệu phụ thuộc vào SubjectTrainingProgram
                await SeedSubjectTrainingProgramsAsync(context);

                // 12. Tạo dữ liệu phụ thuộc vào PreconditionSubject
                await SeedPreconditionSubjectsAsync(context);

                // 13. Tạo dữ liệu MultiExam
                await SeedMultiExamsAsync(context);

                // 14. Tạo dữ liệu PracticeExam
                await SeedPracticeExamsAsync(context);
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while seeding the database: {ex.Message}", ex);
            }
        }

        private static async Task SeedCohortsAsync(GessDbContext context)
        {
            if (!context.Cohorts.Any())
            {
                var cohorts = new List<Cohort>
                {
                    new Cohort { CohortName = "2020-2024" },
                    new Cohort { CohortName = "2021-2025" },
                    new Cohort { CohortName = "2022-2026" },
                    new Cohort { CohortName = "2023-2027" },
                    new Cohort { CohortName = "2024-2028" }
                };
                await context.Cohorts.AddRangeAsync(cohorts);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedRolesAsync(RoleManager<IdentityRole<Guid>> roleManager)
        {
            // ThaiNH_modified_UpdateMark&UserProfile_Begin
            string[] roles = new[] { PredefinedRole.ADMIN_ROLE, PredefinedRole.HEADOFDEPARTMENT_ROLE, PredefinedRole.TEACHER_ROLE, PredefinedRole.EXAMINATION_ROLE, PredefinedRole.STUDENT_ROLE };
            // ThaiNH_modified_UpdateMark&UserProfile_End
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
            //ThaiNH_modified_UpdateMark&UserProfile_Begin
            // Admin users
            await CreateUser(userManager, "admin@example.com", "Nguyễn Văn A", "Password123!", "AM001", new DateTime(1980, 1, 1), "1234567890", true, PredefinedRole.ADMIN_ROLE);
            await CreateUser(userManager, "admin2@example.com", "Trần Thị B", "Password123!", "AM002", new DateTime(1982, 3, 15), "1234567891", true, PredefinedRole.ADMIN_ROLE);

            // Trưởng bộ môn
            await CreateUser(userManager, "hod1@example.com", "Lê Văn C", "Password123!", "HOD001", new DateTime(1983, 5, 10), "0987654321", true, PredefinedRole.HEADOFDEPARTMENT_ROLE);
            await CreateUser(userManager, "hod2@example.com", "Phạm Thị D", "Password123!", "HOD002", new DateTime(1984, 7, 20), "0987654322", false, PredefinedRole.HEADOFDEPARTMENT_ROLE);

            // Giáo viên
            await CreateUser(userManager, "teacher1@example.com", "Hoàng Văn E", "Password123!", "GV001", new DateTime(1985, 5, 10), "0987654323", true, PredefinedRole.TEACHER_ROLE);
            await CreateUser(userManager, "teacher2@example.com", "Vũ Thị F", "Password123!", "GV002", new DateTime(1987, 7, 20), "0987654324", false, PredefinedRole.TEACHER_ROLE);
            await CreateUser(userManager, "teacher3@example.com", "Đỗ Văn G", "Password123!", "GV003", new DateTime(1990, 9, 30), "0987654325", true, PredefinedRole.TEACHER_ROLE);
            await CreateUser(userManager, "teacher4@example.com", "Ngô Văn H", "Password123!", "GV004", new DateTime(1988, 4, 15), "0987654326", true, PredefinedRole.TEACHER_ROLE);
            await CreateUser(userManager, "teacher5@example.com", "Đặng Thị I", "Password123!", "GV005", new DateTime(1989, 6, 25), "0987654327", false, PredefinedRole.TEACHER_ROLE);

            // Khảo thí
            await CreateUser(userManager, "exam1@example.com", "Ngô Thị H", "Password123!", "EX001", new DateTime(1986, 6, 15), "0987654328", false, PredefinedRole.EXAMINATION_ROLE);
            await CreateUser(userManager, "exam2@example.com", "Đặng Văn I", "Password123!", "EX002", new DateTime(1988, 8, 25), "0987654329", true, PredefinedRole.EXAMINATION_ROLE);
            await CreateUser(userManager, "tuanvahe140809@fpt.edu.vn", "Đặng Văn I", "Password123!", "EX003", new DateTime(1988, 8, 25), "0987654329", true, PredefinedRole.EXAMINATION_ROLE);

            // Sinh viên
            await CreateUser(userManager, "student1@example.com", "Phạm Minh J", "Password123!", "SD001", new DateTime(2000, 8, 15), "0123456789", true, PredefinedRole.STUDENT_ROLE);
            await CreateUser(userManager, "student2@example.com", "Hoàng Anh K", "Password123!", "SD002", new DateTime(2001, 9, 20), "0123456790", false, PredefinedRole.STUDENT_ROLE);
            await CreateUser(userManager, "student3@example.com", "Vũ Thị L", "Password123!", "SD003", new DateTime(2002, 10, 25), "0123456791", true, PredefinedRole.STUDENT_ROLE);
            await CreateUser(userManager, "student4@example.com", "Trần Văn M", "Password123!", "SD004", new DateTime(2000, 7, 10), "0123456792", true, PredefinedRole.STUDENT_ROLE);
            await CreateUser(userManager, "student5@example.com", "Lê Thị N", "Password123!", "SD005", new DateTime(2001, 11, 5), "0123456793", false, PredefinedRole.STUDENT_ROLE);
            await CreateUser(userManager, "student6@example.com", "Nguyễn Văn O", "Password123!", "SD006", new DateTime(2002, 3, 15), "0123456794", true, PredefinedRole.STUDENT_ROLE);
            await CreateUser(userManager, "student7@example.com", "Phạm Thị P", "Password123!", "SD007", new DateTime(2000, 5, 20), "0123456795", false, PredefinedRole.STUDENT_ROLE);
            await CreateUser(userManager, "student8@example.com", "Hoàng Văn Q", "Password123!", "SD008", new DateTime(2001, 12, 30), "0123456796", true, PredefinedRole.STUDENT_ROLE);
            //ThaiNH_modified_UpdateMark&UserProfile_End
        }

        private static async Task SeedMajorsAsync(GessDbContext context)
        {
            if (!context.Majors.Any())
            {
                var majors = new List<Major>
                {
                    new Major { MajorName = "CNTT", StartDate = DateTime.Now, IsActive = true },
                    new Major { MajorName = "Điện tử", StartDate = DateTime.Now, IsActive = true },
                    new Major { MajorName = "Cơ khí", StartDate = DateTime.Now, IsActive = true },
                    new Major { MajorName = "Kinh tế", StartDate = DateTime.Now, IsActive = true },
                    new Major { MajorName = "Xây dựng", StartDate = DateTime.Now, IsActive = true }
                };
                await context.Majors.AddRangeAsync(majors);
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
                        SemesterName = "Học kỳ 1 năm 2023-2024",
                        StartDate = new DateTime(2023, 9, 1),
                        EndDate = new DateTime(2024, 1, 15)
                    },
                    new Semester 
                    { 
                        SemesterName = "Học kỳ 2 năm 2023-2024",
                        StartDate = new DateTime(2024, 2, 1),
                        EndDate = new DateTime(2024, 6, 15)
                    }
                };
                await context.Semesters.AddRangeAsync(semesters);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedSubjectsAsync(GessDbContext context)
        {
            if (!context.Subjects.Any())
            {
                var subjects = new List<Subject>
                {
                    new Subject { SubjectName = "Lập trình C#", Description = "Môn học lập trình", Course = "CS101", NoCredits = 3 },
                    new Subject { SubjectName = "Cơ sở dữ liệu", Description = "Môn học CSDL", Course = "DB101", NoCredits = 3 },
                    new Subject { SubjectName = "Mạng máy tính", Description = "Môn học mạng", Course = "NET101", NoCredits = 3 },
                    new Subject { SubjectName = "Toán rời rạc", Description = "Môn học toán", Course = "MATH101", NoCredits = 3 },
                    new Subject { SubjectName = "Kỹ năng mềm", Description = "Môn học kỹ năng", Course = "SOFT101", NoCredits = 2 }
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
                        SubjectId = 1
                    },
                    new Chapter 
                    { 
                        ChapterName = "Chương 2: Cú pháp cơ bản",
                        Description = "Chương về cú pháp cơ bản C#",
                        SubjectId = 1
                    },
                    new Chapter 
                    { 
                        ChapterName = "Chương 3: Lập trình hướng đối tượng",
                        Description = "Chương về OOP trong C#",
                        SubjectId = 1
                    }
                };
                await context.Chapters.AddRangeAsync(chapters);
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
                        ClassName = "Lập trình C# - Nhóm 1",
                        SubjectId = 1,
                        TeacherId = context.Users.First(u => u.Email == "teacher1@example.com").Id,
                        SemesterId = 1
                    },
                    new Class 
                    { 
                        ClassName = "Cơ sở dữ liệu - Nhóm 1",
                        SubjectId = 2,
                        TeacherId = context.Users.First(u => u.Email == "teacher2@example.com").Id,
                        SemesterId = 1
                    },
                    new Class 
                    { 
                        ClassName = "Mạng máy tính - Nhóm 1",
                        SubjectId = 3,
                        TeacherId = context.Users.First(u => u.Email == "teacher3@example.com").Id,
                        SemesterId = 1
                    }
                };
                await context.Classes.AddRangeAsync(classes);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedTeachersAsync(GessDbContext context)
        {
            if (!context.Teachers.Any())
            {
                var teachers = new List<Teacher>
                {
                    new Teacher 
                    { 
                        TeacherId = context.Users.First(u => u.Email == "teacher1@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "teacher1@example.com").Id,
                        HireDate = new DateTime(2020, 9, 1),
                        MajorId = 1 // Công nghệ thông tin
                    },
                    new Teacher 
                    { 
                        TeacherId = context.Users.First(u => u.Email == "teacher2@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "teacher2@example.com").Id,
                        HireDate = new DateTime(2021, 9, 1),
                        MajorId = 1 // Công nghệ thông tin
                    },
                    new Teacher 
                    { 
                        TeacherId = context.Users.First(u => u.Email == "teacher3@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "teacher3@example.com").Id,
                        HireDate = new DateTime(2022, 9, 1),
                        MajorId = 2 // Kỹ thuật điện
                    },
                    new Teacher 
                    { 
                        TeacherId = context.Users.First(u => u.Email == "teacher4@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "teacher4@example.com").Id,
                        HireDate = new DateTime(2023, 9, 1),
                        MajorId = 2 // Kỹ thuật điện
                    },
                    new Teacher 
                    { 
                        TeacherId = context.Users.First(u => u.Email == "teacher5@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "teacher5@example.com").Id,
                        HireDate = new DateTime(2023, 9, 1),
                        MajorId = 3 // Cơ khí
                    }
                };
                await context.Teachers.AddRangeAsync(teachers);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedStudentsAsync(GessDbContext context)
        {
            if (!context.Students.Any())
            {
                var cohortId = context.Cohorts.First().CohortId;
                var students = new List<Student>
                {
                    new Student
                    {
                        StudentId = context.Users.First(u => u.Email == "student1@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "student1@example.com").Id,
                        CohortId = cohortId,
                        EnrollDate = new DateTime(2023, 9, 1)
                    },
                    // ... (lặp lại cho các student khác)
                };
                await context.Students.AddRangeAsync(students);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedClassStudentsAsync(GessDbContext context)
        {
            if (!context.ClassStudents.Any())
            {
                var classStudents = new List<ClassStudent>();
                var students = context.Students.ToList();
                var classes = context.Classes.ToList();

                foreach (var student in students)
                {
                    // Gán mỗi student vào 2 lớp ngẫu nhiên
                    var randomClasses = classes.OrderBy(x => Guid.NewGuid()).Take(2);
                    foreach (var classItem in randomClasses)
                    {
                        classStudents.Add(new ClassStudent
                        {
                            StudentId = student.StudentId,
                            ClassId = classItem.ClassId
                        });
                    }
                }

                await context.ClassStudents.AddRangeAsync(classStudents);
                await context.SaveChangesAsync();
            }
        }

        private static async Task CreateUser(
            UserManager<User> userManager,
            string email,
            string fullName,
            string password,
            string code,
            DateTime dateOfBirth,
            string phoneNumber,
            bool gender,
            string role)
        {
            if (await userManager.FindByEmailAsync(email) == null)
            {
                var user = new User
                {
                    UserName = email,
                    Email = email,
                    Fullname = fullName,
                    // ThaiNH_add_UpdateMark&UserProfile_Begin
                    Code = code,
                    // ThaiNH_add_UpdateMark&UserProfile_End
                    DateOfBirth = dateOfBirth,
                    PhoneNumber = phoneNumber,
                    Gender = gender,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(user, password);
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, role);
                }
                else
                {
                    throw new Exception($"Failed to create user {email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }
        }

        private static async Task SeedPracticeExamDataAsync(GessDbContext context)
        {
            // 1. Seed LevelQuestion
            if (!context.LevelQuestions.Any())
            {
                var levelQuestions = new List<LevelQuestion>
                {
                    new LevelQuestion { LevelQuestionName = "Dễ" },
                    new LevelQuestion { LevelQuestionName = "Trung bình" },
                    new LevelQuestion { LevelQuestionName = "Khó" }
                };
                await context.LevelQuestions.AddRangeAsync(levelQuestions);
                await context.SaveChangesAsync();
            }

            // 2. Seed PracticeQuestions
            if (!context.PracticeQuestions.Any())
            {
                var practiceQuestions = new List<PracticeQuestion>
                {
                    new PracticeQuestion
                    {
                        Content = "Câu hỏi 1: Giải thích khái niệm về lập trình hướng đối tượng trong C#",
                        CategoryExamId = 1,
                        LevelQuestionId = 1,
                        SemesterId = 1,
                        ChapterId = 1,
                        IsActive = true,
                        //CreatedBy = "teacher1@example.com",
                        IsPublic = true,
                        PracticeAnswer = new PracticeAnswer
                        {
                            AnswerContent = "OOP là phương pháp lập trình dựa trên đối tượng..."
                        }
                    },
                    new PracticeQuestion
                    {
                        Content = "Câu hỏi 2: Phân biệt interface và abstract class trong C#",
                        CategoryExamId = 2,
                        LevelQuestionId = 2,
                        SemesterId = 1,
                        ChapterId = 2,
                        IsActive = true,
                        //CreatedBy = "teacher2@example.com",
                        IsPublic = true,
                        PracticeAnswer = new PracticeAnswer
                        {
                            AnswerContent = "Interface chỉ chứa khai báo, abstract class có thể chứa cả phương thức có thân..."
                        }
                    }
                };
                await context.PracticeQuestions.AddRangeAsync(practiceQuestions);
                await context.SaveChangesAsync();
            }

            // 3. Seed PracticeExamPapers
            if (!context.PracticeExamPapers.Any())
            {
                var practiceExamPapers = new List<PracticeExamPaper>
                {
                    new PracticeExamPaper
                    {
                        PracExamPaperName = "Đề thi giữa kỳ C# - Đề 1",
                        NumberQuestion = 1,
                        CreateAt = DateTime.Now,
                        Status = "Published",
                        //CreateBy = "teacher1@example.com",
                        CategoryExamId = 1,
                        SubjectId = 1,
                        SemesterId = 1
                    },
                    new PracticeExamPaper
                    {
                        PracExamPaperName = "Đề thi cuối kỳ C# - Đề 1",
                        NumberQuestion = 1,
                        CreateAt = DateTime.Now,
                        Status = "Published",
                        //CreateBy = "teacher2@example.com",
                        CategoryExamId = 2,
                        SubjectId = 1,
                        SemesterId = 1
                    }
                };
                await context.PracticeExamPapers.AddRangeAsync(practiceExamPapers);
                await context.SaveChangesAsync();
            }

            // 4. Lấy lại ID thực tế
            var practiceQuestionsList = await context.PracticeQuestions.ToListAsync();
            var practiceExamPapersList = await context.PracticeExamPapers.ToListAsync();

            // 5. Seed PracticeTestQuestions
            if (!context.PracticeTestQuestions.Any())
            {
                var practiceTestQuestions = new List<PracticeTestQuestion>
                {
                    new PracticeTestQuestion
                    {
                        PracExamPaperId = practiceExamPapersList[0].PracExamPaperId,
                        PracticeQuestionId = practiceQuestionsList[0].PracticeQuestionId,
                        QuestionOrder = 1,
                        Score = 5.0
                    },
                    new PracticeTestQuestion
                    {
                        PracExamPaperId = practiceExamPapersList[1].PracExamPaperId,
                        PracticeQuestionId = practiceQuestionsList[1].PracticeQuestionId,
                        QuestionOrder = 1,
                        Score = 5.0
                    }
                };
                await context.PracticeTestQuestions.AddRangeAsync(practiceTestQuestions);
                await context.SaveChangesAsync();
            }

            // 6. Seed PracticeExam
            if (!context.PracticeExams.Any())
            {
                var practiceExams = new List<PracticeExam>
                {
                    new PracticeExam
                    {
                        PracExamName = "Kỳ thi giữa kỳ C# - Ca 1",
                        Duration = 90,
                        CreateAt = DateTime.Now,
                        Status = "Published",
                        CodeStart = "C#MID1",
                        //TeacherId = "teacher1@example.com",
                        CategoryExamId = 1, // Thi giữa kỳ
                        SubjectId = 1, // Lập trình C#
                        SemesterId = 1 // Học kỳ 1
                    },
                    new PracticeExam
                    {
                        PracExamName = "Kỳ thi cuối kỳ C# - Ca 1",
                        Duration = 120,
                        CreateAt = DateTime.Now,
                        Status = "Published",
                        CodeStart = "C#FINAL1",
                        //TeacherId = "b3b7e2a5-9e51-4ad1-a944-2e3392d18f7a",
                        CategoryExamId = 2, // Thi cuối kỳ
                        SubjectId = 1, // Lập trình C#
                        SemesterId = 1 // Học kỳ 1
                    }
                };
                await context.PracticeExams.AddRangeAsync(practiceExams);
                await context.SaveChangesAsync();
            }

            // 7. Seed NoPEPaperInPE
            if (!context.NoPEPaperInPEs.Any())
            {
                var practiceExams = await context.PracticeExams.ToListAsync();
                var practiceExamPapers = await context.PracticeExamPapers.ToListAsync();

                if (!practiceExams.Any() || !practiceExamPapers.Any())
                {
                    throw new Exception("Required data for NoPEPaperInPE seeding is missing");
                }

                var noPEPaperInPEs = new List<NoPEPaperInPE>
                {
                    new NoPEPaperInPE
                    {
                        PracExamId = practiceExams[0].PracExamId,
                        PracExamPaperId = practiceExamPapers[0].PracExamPaperId
                    },
                    new NoPEPaperInPE
                    {
                        PracExamId = practiceExams[1].PracExamId,
                        PracExamPaperId = practiceExamPapers[1].PracExamPaperId
                    }
                };
                await context.NoPEPaperInPEs.AddRangeAsync(noPEPaperInPEs);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedCategoryExamDataAsync(GessDbContext context)
        {
            try
            {
                // 1. Seed CategoryExam
                if (!context.CategoryExams.Any())
                {
                    var categoryExamList = new List<CategoryExam>
                    {
                        new CategoryExam { CategoryExamName = "Thi giữa kỳ" },
                        new CategoryExam { CategoryExamName = "Thi cuối kỳ" },
                        new CategoryExam { CategoryExamName = "Thi thử" },
                        new CategoryExam { CategoryExamName = "Thi kiểm tra" },
                        new CategoryExam { CategoryExamName = "Thi đánh giá năng lực" }
                    };
                    await context.CategoryExams.AddRangeAsync(categoryExamList);
                    await context.SaveChangesAsync();
                }

                // 2. Seed Subjects
                if (!context.Subjects.Any())
                {
                    var subjectList = new List<Subject>
                    {
                        new Subject 
                        { 
                            SubjectName = "Lập trình C#",
                            Description = "Môn học về lập trình C# cơ bản đến nâng cao",
                            Course = "CS101",
                            NoCredits = 3
                        },
                        new Subject 
                        { 
                            SubjectName = "Cơ sở dữ liệu",
                            Description = "Môn học về thiết kế và quản lý cơ sở dữ liệu",
                            Course = "CS102",
                            NoCredits = 3
                        },
                        new Subject 
                        { 
                            SubjectName = "Mạng máy tính",
                            Description = "Môn học về nguyên lý và ứng dụng mạng máy tính",
                            Course = "CS103",
                            NoCredits = 3
                        }
                    };
                    await context.Subjects.AddRangeAsync(subjectList);
                    await context.SaveChangesAsync();
                }

                // 3. Verify that both CategoryExam and Subject data exist and get their IDs
                var existingCategoryExams = await context.CategoryExams.ToListAsync();
                var existingSubjects = await context.Subjects.ToListAsync();

                if (!existingCategoryExams.Any() || !existingSubjects.Any())
                {
                    throw new Exception("Failed to seed CategoryExam or Subject data");
                }

                // 4. Seed CategoryExamSubject using actual IDs from the database
                if (!context.CategoryExamSubjects.Any())
                {
                    var categoryExamSubjects = new List<CategoryExamSubject>();
                    
                    // Lấy các loại thi
                    var midtermExam = existingCategoryExams.FirstOrDefault(c => c.CategoryExamName == "Thi giữa kỳ");
                    var finalExam = existingCategoryExams.FirstOrDefault(c => c.CategoryExamName == "Thi cuối kỳ");
                    var practiceExam = existingCategoryExams.FirstOrDefault(c => c.CategoryExamName == "Thi thử");
                    var testExam = existingCategoryExams.FirstOrDefault(c => c.CategoryExamName == "Thi kiểm tra");
                    var assessmentExam = existingCategoryExams.FirstOrDefault(c => c.CategoryExamName == "Thi đánh giá năng lực");

                    if (midtermExam == null || finalExam == null || practiceExam == null || testExam == null || assessmentExam == null)
                    {
                        throw new Exception("One or more CategoryExam types are missing");
                    }

                    // Lấy các môn học
                    var csharpSubject = existingSubjects.FirstOrDefault(s => s.SubjectName == "Lập trình C#");
                    var dbSubject = existingSubjects.FirstOrDefault(s => s.SubjectName == "Cơ sở dữ liệu");
                    var networkSubject = existingSubjects.FirstOrDefault(s => s.SubjectName == "Mạng máy tính");

                    if (csharpSubject == null || dbSubject == null || networkSubject == null)
                    {
                        throw new Exception("One or more Subjects are missing");
                    }

                    // Lập trình C#
                    categoryExamSubjects.Add(new CategoryExamSubject 
                    { 
                        CategoryExamId = midtermExam.CategoryExamId, 
                        SubjectId = csharpSubject.SubjectId, 
                        GradeComponent = 30.0m, 
                        IsDelete = false 
                    });
                    categoryExamSubjects.Add(new CategoryExamSubject 
                    { 
                        CategoryExamId = finalExam.CategoryExamId, 
                        SubjectId = csharpSubject.SubjectId, 
                        GradeComponent = 70.0m, 
                        IsDelete = false 
                    });

                    // Cơ sở dữ liệu
                    categoryExamSubjects.Add(new CategoryExamSubject 
                    { 
                        CategoryExamId = midtermExam.CategoryExamId, 
                        SubjectId = dbSubject.SubjectId, 
                        GradeComponent = 30.0m, 
                        IsDelete = false 
                    });
                    categoryExamSubjects.Add(new CategoryExamSubject 
                    { 
                        CategoryExamId = finalExam.CategoryExamId, 
                        SubjectId = dbSubject.SubjectId, 
                        GradeComponent = 50.0m, 
                        IsDelete = false 
                    });
                    categoryExamSubjects.Add(new CategoryExamSubject 
                    { 
                        CategoryExamId = practiceExam.CategoryExamId, 
                        SubjectId = dbSubject.SubjectId, 
                        GradeComponent = 20.0m, 
                        IsDelete = false 
                    });

                    // Mạng máy tính
                    categoryExamSubjects.Add(new CategoryExamSubject 
                    { 
                        CategoryExamId = midtermExam.CategoryExamId, 
                        SubjectId = networkSubject.SubjectId, 
                        GradeComponent = 25.0m, 
                        IsDelete = false 
                    });
                    categoryExamSubjects.Add(new CategoryExamSubject 
                    { 
                        CategoryExamId = finalExam.CategoryExamId, 
                        SubjectId = networkSubject.SubjectId, 
                        GradeComponent = 65.0m, 
                        IsDelete = false 
                    });
                    categoryExamSubjects.Add(new CategoryExamSubject 
                    { 
                        CategoryExamId = testExam.CategoryExamId, 
                        SubjectId = networkSubject.SubjectId, 
                        GradeComponent = 10.0m, 
                        IsDelete = false 
                    });

                    await context.CategoryExamSubjects.AddRangeAsync(categoryExamSubjects);
                    await context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Error seeding CategoryExam data: {ex.Message}", ex);
            }
        }

        private static async Task SeedExamSlotsAsync(GessDbContext context)
        {
            if (!context.ExamSlots.Any())
            {
                var examSlot = new ExamSlot
                {
                    SlotName = "Ca 1",
                    StartTime = new DateTime(2024, 6, 1, 8, 0, 0),
                    EndTime = new DateTime(2024, 6, 1, 10, 0, 0)
                };
                await context.ExamSlots.AddAsync(examSlot);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedExamSlotRoomsAsync(GessDbContext context)
        {
            if (!context.ExamSlotRooms.Any())
            {
                var examSlotRoom = new ExamSlotRoom
                {
                    RoomId = context.Rooms.First().RoomId,
                    ExamSlotId = context.ExamSlots.First().ExamSlotId,
                    SemesterId = 1,
                    SubjectId = 1,
                    SupervisorId = context.Teachers.First().TeacherId,
                    ExamGradedId = context.Teachers.First().TeacherId
                };
                await context.ExamSlotRooms.AddAsync(examSlotRoom);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedFinalExamsAsync(GessDbContext context)
        {
            if (!context.FinalExams.Any())
            {
                var finalExam = new FinalExam
                {
                    MultiExamId = context.MultiExams.First().MultiExamId,
                    MultiQuestionId = context.MultiQuestions.First().MultiQuestionId
                };
                await context.FinalExams.AddAsync(finalExam);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedPracticeTestQuestionsAsync(GessDbContext context)
        {
            if (!context.PracticeTestQuestions.Any())
            {
                var pracTestQuestion = new PracticeTestQuestion
                {
                    PracExamPaperId = context.PracticeExamPapers.First().PracExamPaperId,
                    PracticeQuestionId = context.PracticeQuestions.First().PracticeQuestionId,
                    QuestionOrder = 1,
                    Score = 5.0
                };
                await context.PracticeTestQuestions.AddAsync(pracTestQuestion);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedNoQuestionInChaptersAsync(GessDbContext context)
        {
            if (!context.NoQuestionInChapters.Any())
            {
                var noQuestion = new NoQuestionInChapter
                {
                    MultiExamId = context.MultiExams.First().MultiExamId,
                    ChapterId = context.Chapters.First().ChapterId,
                    NumberQuestion = 5
                };
                await context.NoQuestionInChapters.AddAsync(noQuestion);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedNoPEPaperInPEsAsync(GessDbContext context)
        {
            if (!context.NoPEPaperInPEs.Any())
            {
                var practiceExams = await context.PracticeExams.ToListAsync();
                var practiceExamPapers = await context.PracticeExamPapers.ToListAsync();

                if (!practiceExams.Any() || !practiceExamPapers.Any())
                {
                    throw new Exception("Required data for NoPEPaperInPE seeding is missing");
                }

                var noPEPaperInPEs = new List<NoPEPaperInPE>
                {
                    new NoPEPaperInPE
                    {
                        PracExamId = practiceExams[0].PracExamId,
                        PracExamPaperId = practiceExamPapers[0].PracExamPaperId
                    },
                    new NoPEPaperInPE
                    {
                        PracExamId = practiceExams[1].PracExamId,
                        PracExamPaperId = practiceExamPapers[1].PracExamPaperId
                    }
                };
                await context.NoPEPaperInPEs.AddRangeAsync(noPEPaperInPEs);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedTrainingProgramsAsync(GessDbContext context)
        {
            if (!context.TrainingPrograms.Any())
            {
                var majors = context.Majors.Take(5).ToList();
                var programs = new List<TrainingProgram>
                {
                    new TrainingProgram { TrainProName = "Chương trình A", StartDate = DateTime.Now, EndDate = DateTime.Now.AddYears(4), NoCredits = 120, MajorId = majors[0].MajorId },
                    new TrainingProgram { TrainProName = "Chương trình B", StartDate = DateTime.Now, EndDate = DateTime.Now.AddYears(4), NoCredits = 120, MajorId = majors[1].MajorId },
                    new TrainingProgram { TrainProName = "Chương trình C", StartDate = DateTime.Now, EndDate = DateTime.Now.AddYears(4), NoCredits = 120, MajorId = majors[2].MajorId },
                    new TrainingProgram { TrainProName = "Chương trình D", StartDate = DateTime.Now, EndDate = DateTime.Now.AddYears(4), NoCredits = 120, MajorId = majors[3].MajorId },
                    new TrainingProgram { TrainProName = "Chương trình E", StartDate = DateTime.Now, EndDate = DateTime.Now.AddYears(4), NoCredits = 120, MajorId = majors[4].MajorId }
                };
                await context.TrainingPrograms.AddRangeAsync(programs);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedApplyTrainingProgramsAsync(GessDbContext context)
        {
            if (!context.ApplyTrainingPrograms.Any())
            {
                var programs = context.TrainingPrograms.Take(5).ToList();
                var cohorts = context.Cohorts.Take(5).ToList();
                var applys = new List<ApplyTrainingProgram>();
                for (int i = 0; i < 5; i++)
                {
                    applys.Add(new ApplyTrainingProgram { TrainProId = programs[i].TrainProId, CohortId = cohorts[i].CohortId });
                }
                await context.ApplyTrainingPrograms.AddRangeAsync(applys);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedRoomsAsync(GessDbContext context)
        {
            if (!context.Rooms.Any())
            {
                var rooms = new List<Room>
                {
                    new Room { RoomName = "A101", Capacity = 40, Status = "Available", Description = "Phòng học lý thuyết" },
                    new Room { RoomName = "B202", Capacity = 30, Status = "Available", Description = "Phòng máy tính" },
                    new Room { RoomName = "C303", Capacity = 50, Status = "Available", Description = "Phòng hội thảo" },
                    new Room { RoomName = "D404", Capacity = 35, Status = "Available", Description = "Phòng lab" },
                    new Room { RoomName = "E505", Capacity = 25, Status = "Available", Description = "Phòng seminar" }
                };
                await context.Rooms.AddRangeAsync(rooms);
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
                    new LevelQuestion { LevelQuestionName = "Khó" },
                    new LevelQuestion { LevelQuestionName = "Rất khó" },
                    new LevelQuestion { LevelQuestionName = "Cơ bản" }
                };
                await context.LevelQuestions.AddRangeAsync(levels);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedSubjectTrainingProgramsAsync(GessDbContext context)
        {
            if (!context.SubjectTrainingPrograms.Any())
            {
                var subjects = context.Subjects.Take(5).ToList();
                var programs = context.TrainingPrograms.Take(5).ToList();
                var stps = new List<SubjectTrainingProgram>();
                for (int i = 0; i < 5; i++)
                {
                    stps.Add(new SubjectTrainingProgram { SubjectId = subjects[i].SubjectId, TrainProId = programs[i].TrainProId });
                }
                await context.SubjectTrainingPrograms.AddRangeAsync(stps);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedPreconditionSubjectsAsync(GessDbContext context)
        {
            if (!context.PreconditionSubjects.Any())
            {
                var stps = context.SubjectTrainingPrograms.Take(5).ToList();
                var subjects = context.Subjects.Take(5).ToList();
                var preconditions = new List<PreconditionSubject>();
                for (int i = 0; i < 5; i++)
                {
                    preconditions.Add(new PreconditionSubject { SubTrainingProgramId = stps[i].SubTrainProgramId, PreconditionSubjectId = subjects[(i+1)%5].SubjectId });
                }
                await context.PreconditionSubjects.AddRangeAsync(preconditions);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedMultiExamsAsync(GessDbContext context)
        {
            if (!context.MultiExams.Any())
            {
                var teacher = context.Teachers.First();
                var subject = context.Subjects.First();
                var cateExam = context.CategoryExams.First();
                var semester = context.Semesters.First();
                var multiExams = new List<MultiExam>
                {
                    new MultiExam { MultiExamName = "Midterm 1", NumberQuestion = 10, Duration = 60, CreateAt = DateTime.Now, Status = "Published", CodeStart = "MID1", TeacherId = teacher.TeacherId, SubjectId = subject.SubjectId, CategoryExamId = cateExam.CategoryExamId, SemesterId = semester.SemesterId, IsPublish = true },
                    new MultiExam { MultiExamName = "Midterm 2", NumberQuestion = 15, Duration = 70, CreateAt = DateTime.Now, Status = "Published", CodeStart = "MID2", TeacherId = teacher.TeacherId, SubjectId = subject.SubjectId, CategoryExamId = cateExam.CategoryExamId, SemesterId = semester.SemesterId, IsPublish = true },
                    new MultiExam { MultiExamName = "Final 1", NumberQuestion = 20, Duration = 90, CreateAt = DateTime.Now, Status = "Published", CodeStart = "FIN1", TeacherId = teacher.TeacherId, SubjectId = subject.SubjectId, CategoryExamId = cateExam.CategoryExamId, SemesterId = semester.SemesterId, IsPublish = true },
                    new MultiExam { MultiExamName = "Final 2", NumberQuestion = 25, Duration = 100, CreateAt = DateTime.Now, Status = "Published", CodeStart = "FIN2", TeacherId = teacher.TeacherId, SubjectId = subject.SubjectId, CategoryExamId = cateExam.CategoryExamId, SemesterId = semester.SemesterId, IsPublish = true },
                    new MultiExam { MultiExamName = "Quiz", NumberQuestion = 5, Duration = 30, CreateAt = DateTime.Now, Status = "Published", CodeStart = "QUIZ", TeacherId = teacher.TeacherId, SubjectId = subject.SubjectId, CategoryExamId = cateExam.CategoryExamId, SemesterId = semester.SemesterId, IsPublish = true }
                };
                await context.MultiExams.AddRangeAsync(multiExams);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedPracticeExamsAsync(GessDbContext context)
        {
            if (!context.PracticeExams.Any())
            {
                var teacher = context.Teachers.First();
                var subject = context.Subjects.First();
                var cateExam = context.CategoryExams.First();
                var semester = context.Semesters.First();
                var pracExams = new List<PracticeExam>
                {
                    new PracticeExam { PracExamName = "Practice 1", Duration = 60, CreateAt = DateTime.Now, Status = "Published", CodeStart = "PRA1", TeacherId = teacher.TeacherId, CategoryExamId = cateExam.CategoryExamId, SubjectId = subject.SubjectId, SemesterId = semester.SemesterId },
                    new PracticeExam { PracExamName = "Practice 2", Duration = 70, CreateAt = DateTime.Now, Status = "Published", CodeStart = "PRA2", TeacherId = teacher.TeacherId, CategoryExamId = cateExam.CategoryExamId, SubjectId = subject.SubjectId, SemesterId = semester.SemesterId },
                    new PracticeExam { PracExamName = "Practice 3", Duration = 80, CreateAt = DateTime.Now, Status = "Published", CodeStart = "PRA3", TeacherId = teacher.TeacherId, CategoryExamId = cateExam.CategoryExamId, SubjectId = subject.SubjectId, SemesterId = semester.SemesterId },
                    new PracticeExam { PracExamName = "Practice 4", Duration = 90, CreateAt = DateTime.Now, Status = "Published", CodeStart = "PRA4", TeacherId = teacher.TeacherId, CategoryExamId = cateExam.CategoryExamId, SubjectId = subject.SubjectId, SemesterId = semester.SemesterId },
                    new PracticeExam { PracExamName = "Practice 5", Duration = 100, CreateAt = DateTime.Now, Status = "Published", CodeStart = "PRA5", TeacherId = teacher.TeacherId, CategoryExamId = cateExam.CategoryExamId, SubjectId = subject.SubjectId, SemesterId = semester.SemesterId }
                };
                await context.PracticeExams.AddRangeAsync(pracExams);
                await context.SaveChangesAsync();
            }
        }
    }
}
