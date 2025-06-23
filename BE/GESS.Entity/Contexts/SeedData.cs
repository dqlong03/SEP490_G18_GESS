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

                // 6. Tạo dữ liệu LevelQuestion (cần thiết cho questions)
                await SeedLevelQuestionsAsync(context);

                // 7. Tạo dữ liệu cho phần thi tự luận (phụ thuộc vào CategoryExam, Subject, Chapter)
                await SeedPracticeExamDataAsync(context);

                // 8. Tạo dữ liệu Rooms (cần thiết cho ExamSlotRoom)
                await SeedRoomsAsync(context);

                // 9. Tạo dữ liệu TrainingPrograms (cần thiết cho ApplyTrainingProgram)
                await SeedTrainingProgramsAsync(context);

                // 10. Tạo dữ liệu ApplyTrainingProgram
                await SeedApplyTrainingProgramsAsync(context);

                // 11. Tạo dữ liệu phụ thuộc vào SubjectTrainingProgram
                await SeedSubjectTrainingProgramsAsync(context);

                // 12. Tạo dữ liệu phụ thuộc vào PreconditionSubject
                await SeedPreconditionSubjectsAsync(context);

                // 13. Tạo dữ liệu MultiExam
                await SeedMultiExamsAsync(context);

                // 14. Tạo dữ liệu PracticeExam
                await SeedPracticeExamsAsync(context);

                // 15. Tạo dữ liệu cho thi trắc nghiệm và tự luận của sinh viên
                await SeedMultiQuestionsAsync(context);
                await SeedMultiAnswersAsync(context);
                await SeedMultiExamHistoriesAsync(context);
                await SeedQuestionMultiExamsAsync(context);
                await SeedPracticeExamHistoriesAsync(context);
                await SeedQuestionPracExamsAsync(context);

                // 16. Tạo dữ liệu cho phần thi trắc nghiệm (phụ thuộc vào ExamSlot, ExamSlotRoom, FinalExam, PracticeTestQuestion, NoQuestionInChapter, NoPEPaperInPE)
                await SeedExamSlotsAsync(context);
                await SeedExamSlotRoomsAsync(context);
                await SeedFinalExamsAsync(context);
                await SeedNoQuestionInChaptersAsync(context);
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
                        IsActive = true
                        //StartDate = new DateTime(2023, 9, 1),
                        //EndDate = new DateTime(2024, 1, 15)
                    },
                    new Semester
                    {
                        SemesterName = "Học kỳ 2 năm 2023-2024",
                        IsActive = true
                        //StartDate = new DateTime(2024, 2, 1),
                        //EndDate = new DateTime(2024, 6, 15)
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
                // Kiểm tra dữ liệu cần thiết
                if (!context.Subjects.Any())
                {
                    throw new Exception("No Subjects found. Please seed Subjects first.");
                }
                if (!context.Subjects.Any(s => s.SubjectName == "Lập trình C#"))
                {
                    throw new Exception("Subject 'Lập trình C#' not found. Please seed Subjects first.");
                }

                // Lấy SubjectId thực tế từ database
                var csharpSubject = context.Subjects.First(s => s.SubjectName == "Lập trình C#");
                
                var chapters = new List<Chapter>
                {
                    new Chapter 
                    { 
                        ChapterName = "Chương 1: Giới thiệu C#",
                        Description = "Chương mở đầu về C#",
                        SubjectId = csharpSubject.SubjectId
                    },
                    new Chapter 
                    { 
                        ChapterName = "Chương 2: Cú pháp cơ bản",
                        Description = "Chương về cú pháp cơ bản C#",
                        SubjectId = csharpSubject.SubjectId
                    },
                    new Chapter 
                    { 
                        ChapterName = "Chương 3: Lập trình hướng đối tượng",
                        Description = "Chương về OOP trong C#",
                        SubjectId = csharpSubject.SubjectId
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
                // Kiểm tra dữ liệu cần thiết
                if (!context.Semesters.Any())
                {
                    throw new Exception("No Semesters found. Please seed Semesters first.");
                }
                if (!context.Subjects.Any())
                {
                    throw new Exception("No Subjects found. Please seed Subjects first.");
                }
                if (!context.Users.Any(u => u.Email == "teacher1@example.com"))
                {
                    throw new Exception("Teacher1 not found. Please seed Users first.");
                }
                if (!context.Users.Any(u => u.Email == "teacher2@example.com"))
                {
                    throw new Exception("Teacher2 not found. Please seed Users first.");
                }
                if (!context.Users.Any(u => u.Email == "teacher3@example.com"))
                {
                    throw new Exception("Teacher3 not found. Please seed Users first.");
                }

                // Lấy ID thực tế từ database
                var semester = context.Semesters.First();
                var subject1 = context.Subjects.First(s => s.SubjectName == "Lập trình C#");
                var subject2 = context.Subjects.First(s => s.SubjectName == "Cơ sở dữ liệu");
                var subject3 = context.Subjects.First(s => s.SubjectName == "Mạng máy tính");
                
                var classes = new List<Class>
                {
                    new Class 
                    { 
                        ClassName = "Lập trình C# - Nhóm 1",
                        SubjectId = subject1.SubjectId,
                        TeacherId = context.Users.First(u => u.Email == "teacher1@example.com").Id,
                        SemesterId = semester.SemesterId
                    },
                    new Class 
                    { 
                        ClassName = "Cơ sở dữ liệu - Nhóm 1",
                        SubjectId = subject2.SubjectId,
                        TeacherId = context.Users.First(u => u.Email == "teacher2@example.com").Id,
                        SemesterId = semester.SemesterId
                    },
                    new Class 
                    { 
                        ClassName = "Mạng máy tính - Nhóm 1",
                        SubjectId = subject3.SubjectId,
                        TeacherId = context.Users.First(u => u.Email == "teacher3@example.com").Id,
                        SemesterId = semester.SemesterId
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
                // Kiểm tra dữ liệu cần thiết
                if (!context.Majors.Any())
                {
                    throw new Exception("No Majors found. Please seed Majors first.");
                }
                if (!context.Users.Any(u => u.Email == "teacher1@example.com"))
                {
                    throw new Exception("Teacher1 not found. Please seed Users first.");
                }
                if (!context.Users.Any(u => u.Email == "teacher2@example.com"))
                {
                    throw new Exception("Teacher2 not found. Please seed Users first.");
                }
                if (!context.Users.Any(u => u.Email == "teacher3@example.com"))
                {
                    throw new Exception("Teacher3 not found. Please seed Users first.");
                }
                if (!context.Users.Any(u => u.Email == "teacher4@example.com"))
                {
                    throw new Exception("Teacher4 not found. Please seed Users first.");
                }
                if (!context.Users.Any(u => u.Email == "teacher5@example.com"))
                {
                    throw new Exception("Teacher5 not found. Please seed Users first.");
                }

                // Lấy MajorId thực tế từ database
                var majorCNTT = context.Majors.First(m => m.MajorName == "CNTT");
                var majorDienTu = context.Majors.First(m => m.MajorName == "Điện tử");
                var majorCoKhi = context.Majors.First(m => m.MajorName == "Cơ khí");
                
                var teachers = new List<Teacher>
                {
                    new Teacher 
                    { 
                        TeacherId = context.Users.First(u => u.Email == "teacher1@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "teacher1@example.com").Id,
                        HireDate = new DateTime(2020, 9, 1),
                        MajorId = majorCNTT.MajorId
                    },
                    new Teacher 
                    { 
                        TeacherId = context.Users.First(u => u.Email == "teacher2@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "teacher2@example.com").Id,
                        HireDate = new DateTime(2021, 9, 1),
                        MajorId = majorCNTT.MajorId
                    },
                    new Teacher 
                    { 
                        TeacherId = context.Users.First(u => u.Email == "teacher3@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "teacher3@example.com").Id,
                        HireDate = new DateTime(2022, 9, 1),
                        MajorId = majorDienTu.MajorId
                    },
                    new Teacher 
                    { 
                        TeacherId = context.Users.First(u => u.Email == "teacher4@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "teacher4@example.com").Id,
                        HireDate = new DateTime(2023, 9, 1),
                        MajorId = majorDienTu.MajorId
                    },
                    new Teacher 
                    { 
                        TeacherId = context.Users.First(u => u.Email == "teacher5@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "teacher5@example.com").Id,
                        HireDate = new DateTime(2023, 9, 1),
                        MajorId = majorCoKhi.MajorId
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
                    new Student
                    {
                        StudentId = context.Users.First(u => u.Email == "student2@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "student2@example.com").Id,
                        CohortId = cohortId,
                        EnrollDate = new DateTime(2023, 9, 1)
                    },
                    new Student
                    {
                        StudentId = context.Users.First(u => u.Email == "student3@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "student3@example.com").Id,
                        CohortId = cohortId,
                        EnrollDate = new DateTime(2023, 9, 1)
                    },
                    new Student
                    {
                        StudentId = context.Users.First(u => u.Email == "student4@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "student4@example.com").Id,
                        CohortId = cohortId,
                        EnrollDate = new DateTime(2023, 9, 1)
                    },
                    new Student
                    {
                        StudentId = context.Users.First(u => u.Email == "student5@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "student5@example.com").Id,
                        CohortId = cohortId,
                        EnrollDate = new DateTime(2023, 9, 1)
                    },
                    new Student
                    {
                        StudentId = context.Users.First(u => u.Email == "student6@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "student6@example.com").Id,
                        CohortId = cohortId,
                        EnrollDate = new DateTime(2023, 9, 1)
                    },
                    new Student
                    {
                        StudentId = context.Users.First(u => u.Email == "student7@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "student7@example.com").Id,
                        CohortId = cohortId,
                        EnrollDate = new DateTime(2023, 9, 1)
                    },
                    new Student
                    {
                        StudentId = context.Users.First(u => u.Email == "student8@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "student8@example.com").Id,
                        CohortId = cohortId,
                        EnrollDate = new DateTime(2023, 9, 1)
                    }
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
            // 1. Seed PracticeQuestions
            if (!context.PracticeQuestions.Any())
            {
                var teacherUser = context.Users.First(u => u.Email == "teacher1@example.com");
                
                // Lấy ID thực tế từ database
                var midtermCategory = context.CategoryExams.First(c => c.CategoryExamName == "Thi giữa kỳ");
                var finalCategory = context.CategoryExams.First(c => c.CategoryExamName == "Thi cuối kỳ");
                var easyLevel = context.LevelQuestions.First(l => l.LevelQuestionName == "Dễ");
                var mediumLevel = context.LevelQuestions.First(l => l.LevelQuestionName == "Trung bình");
                var semester = context.Semesters.First();
                var chapter1 = context.Chapters.First(c => c.ChapterName == "Chương 1: Giới thiệu C#");
                var chapter2 = context.Chapters.First(c => c.ChapterName == "Chương 2: Cú pháp cơ bản");
                
                var practiceQuestions = new List<PracticeQuestion>
                {
                    new PracticeQuestion
                    {
                        Content = "Câu hỏi 1: Giải thích khái niệm về lập trình hướng đối tượng trong C#",
                        CategoryExamId = midtermCategory.CategoryExamId,
                        LevelQuestionId = easyLevel.LevelQuestionId,
                        SemesterId = semester.SemesterId,
                        ChapterId = chapter1.ChapterId,
                        IsActive = true,
                        CreatedBy = teacherUser.Id,
                        IsPublic = true,
                        PracticeAnswer = new PracticeAnswer
                        {
                            AnswerContent = "OOP là phương pháp lập trình dựa trên đối tượng..."
                        }
                    },
                    new PracticeQuestion
                    {
                        Content = "Câu hỏi 2: Phương thức nào được gọi khi tạo một đối tượng mới trong C#?",
                        CategoryExamId = finalCategory.CategoryExamId,
                        LevelQuestionId = mediumLevel.LevelQuestionId,
                        SemesterId = semester.SemesterId,
                        ChapterId = chapter2.ChapterId,
                        IsActive = true,
                        CreatedBy = teacherUser.Id,
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

            // 2. Seed PracticeExamPapers
            if (!context.PracticeExamPapers.Any())
            {
                var teacherUser = context.Users.First(u => u.Email == "teacher1@example.com");
                
                // Lấy ID thực tế từ database
                var midtermCategory = context.CategoryExams.First(c => c.CategoryExamName == "Thi giữa kỳ");
                var finalCategory = context.CategoryExams.First(c => c.CategoryExamName == "Thi cuối kỳ");
                var csharpSubject = context.Subjects.First(s => s.SubjectName == "Lập trình C#");
                var semester = context.Semesters.First();
                
                var practiceExamPapers = new List<PracticeExamPaper>
                {
                    new PracticeExamPaper
                    {
                        PracExamPaperName = "Đề thi giữa kỳ C# - Đề 1",
                        NumberQuestion = 1,
                        CreateAt = DateTime.Now,
                        Status = "Published",
                        TeacherId = teacherUser.Id,
                        CategoryExamId = midtermCategory.CategoryExamId,
                        SubjectId = csharpSubject.SubjectId,
                        SemesterId = semester.SemesterId
                    },
                    new PracticeExamPaper
                    {
                        PracExamPaperName = "Đề thi cuối kỳ C# - Đề 1",
                        NumberQuestion = 1,
                        CreateAt = DateTime.Now,
                        Status = "Published",
                        TeacherId = teacherUser.Id,
                        CategoryExamId = finalCategory.CategoryExamId,
                        SubjectId = csharpSubject.SubjectId,
                        SemesterId = semester.SemesterId
                    }
                };
                await context.PracticeExamPapers.AddRangeAsync(practiceExamPapers);
                await context.SaveChangesAsync();
            }

            // 3. Lấy lại ID thực tế
            var practiceQuestionsList = await context.PracticeQuestions.ToListAsync();
            var practiceExamPapersList = await context.PracticeExamPapers.ToListAsync();

            // 4. Seed PracticeTestQuestions
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

            // 5. Seed PracticeExam
            if (!context.PracticeExams.Any())
            {
                var teacherUser = context.Users.First(u => u.Email == "teacher1@example.com");
                
                // Lấy ID thực tế từ database
                var midtermCategory = context.CategoryExams.First(c => c.CategoryExamName == "Thi giữa kỳ");
                var finalCategory = context.CategoryExams.First(c => c.CategoryExamName == "Thi cuối kỳ");
                var csharpSubject = context.Subjects.First(s => s.SubjectName == "Lập trình C#");
                var semester = context.Semesters.First();
                var csharpClass = context.Classes.First(c => c.SubjectId == csharpSubject.SubjectId);
                
                var practiceExams = new List<PracticeExam>
                {
                    new PracticeExam
                    {
                        PracExamName = "Kỳ thi giữa kỳ C# - Ca 1",
                        Duration = 90,
                        CreateAt = DateTime.Now,
                        Status = "Published",
                        CodeStart = "C#MID1",
                        TeacherId = teacherUser.Id,
                        CategoryExamId = midtermCategory.CategoryExamId,
                        SubjectId = csharpSubject.SubjectId,
                        SemesterId = semester.SemesterId,
                        ClassId = csharpClass.ClassId
                    },
                    new PracticeExam
                    {
                        PracExamName = "Kỳ thi cuối kỳ C# - Ca 1",
                        Duration = 120,
                        CreateAt = DateTime.Now,
                        Status = "Published",
                        CodeStart = "C#FINAL1",
                        TeacherId = teacherUser.Id,
                        CategoryExamId = finalCategory.CategoryExamId,
                        SubjectId = csharpSubject.SubjectId,
                        SemesterId = semester.SemesterId,
                        ClassId = csharpClass.ClassId
                    }
                };
                await context.PracticeExams.AddRangeAsync(practiceExams);
                await context.SaveChangesAsync();
            }

            // 6. Seed NoPEPaperInPE
            if (!context.NoPEPaperInPEs.Any())
            {
                var practiceExams = await context.PracticeExams.ToListAsync();
                var practiceExamPapers = await context.PracticeExamPapers.ToListAsync();

                if (!practiceExams.Any() || !practiceExamPapers.Any())
                {
                    throw new Exception("Required data for NoPEPaperInPE seeding is missing");
                }

                // Kiểm tra có đủ dữ liệu không
                if (practiceExams.Count < 2 || practiceExamPapers.Count < 2)
                {
                    throw new Exception($"Insufficient data: PracticeExams count: {practiceExams.Count}, PracticeExamPapers count: {practiceExamPapers.Count}");
                }

                var noPEPaperInPEs = new List<NoPEPaperInPE>();
                
                // Tạo liên kết cho tất cả practice exams và papers có sẵn
                for (int i = 0; i < Math.Min(practiceExams.Count, practiceExamPapers.Count); i++)
                {
                    noPEPaperInPEs.Add(new NoPEPaperInPE
                    {
                        PracExamId = practiceExams[i].PracExamId,
                        PracExamPaperId = practiceExamPapers[i].PracExamPaperId
                    });
                }

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
                // Kiểm tra dữ liệu cần thiết
                if (!context.Rooms.Any())
                {
                    throw new Exception("No Rooms found. Please seed Rooms first.");
                }
                if (!context.ExamSlots.Any())
                {
                    throw new Exception("No ExamSlots found. Please seed ExamSlots first.");
                }
                if (!context.Semesters.Any())
                {
                    throw new Exception("No Semesters found. Please seed Semesters first.");
                }
                if (!context.Subjects.Any())
                {
                    throw new Exception("No Subjects found. Please seed Subjects first.");
                }
                if (!context.Teachers.Any())
                {
                    throw new Exception("No Teachers found. Please seed Teachers first.");
                }

                // Lấy ID thực tế từ database
                var room = context.Rooms.First();
                var examSlot = context.ExamSlots.First();
                var semester = context.Semesters.First();
                var subject = context.Subjects.First();
                var teacher = context.Teachers.First();

                var examSlotRoom = new ExamSlotRoom
                {
                    RoomId = room.RoomId,
                    ExamSlotId = examSlot.ExamSlotId,
                    SemesterId = semester.SemesterId,
                    SubjectId = subject.SubjectId,
                    SupervisorId = teacher.TeacherId,
                    ExamGradedId = teacher.TeacherId,
                    MultiOrPractice = "Multi" // Set to "Multi" for multiple choice exam
                };
                await context.ExamSlotRooms.AddAsync(examSlotRoom);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedFinalExamsAsync(GessDbContext context)
        {
            if (!context.FinalExams.Any())
            {
                // Kiểm tra dữ liệu cần thiết
                if (!context.MultiExams.Any())
                {
                    throw new Exception("No MultiExams found. Please seed MultiExams first.");
                }
                if (!context.MultiQuestions.Any())
                {
                    throw new Exception("No MultiQuestions found. Please seed MultiQuestions first.");
                }

                // Lấy ID thực tế từ database
                var multiExam = context.MultiExams.First();
                var multiQuestion = context.MultiQuestions.First();

                var finalExam = new FinalExam
                {
                    MultiExamId = multiExam.MultiExamId,
                    MultiQuestionId = multiQuestion.MultiQuestionId
                };
                await context.FinalExams.AddAsync(finalExam);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedNoQuestionInChaptersAsync(GessDbContext context)
        {
            if (!context.NoQuestionInChapters.Any())
            {
                // Kiểm tra dữ liệu cần thiết
                if (!context.MultiExams.Any())
                {
                    throw new Exception("No MultiExams found. Please seed MultiExams first.");
                }
                if (!context.Chapters.Any())
                {
                    throw new Exception("No Chapters found. Please seed Chapters first.");
                }
                if (!context.LevelQuestions.Any())
                {
                    throw new Exception("No LevelQuestions found. Please seed LevelQuestions first.");
                }

                // Lấy ID thực tế từ database
                var multiExam = context.MultiExams.First();
                var chapter = context.Chapters.First();
                var levelQuestion = context.LevelQuestions.First();

                var noQuestion = new NoQuestionInChapter
                {
                    MultiExamId = multiExam.MultiExamId,
                    ChapterId = chapter.ChapterId,
                    LevelQuestionId = levelQuestion.LevelQuestionId,
                    NumberQuestion = 5
                };
                await context.NoQuestionInChapters.AddAsync(noQuestion);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedTrainingProgramsAsync(GessDbContext context)
        {
            if (!context.TrainingPrograms.Any())
            {
                var majors = context.Majors.Take(5).ToList();
                
                if (!majors.Any())
                {
                    throw new Exception("No majors found for TrainingProgram seeding");
                }

                var programs = new List<TrainingProgram>();
                
                for (int i = 0; i < majors.Count; i++)
                {
                    programs.Add(new TrainingProgram 
                    { 
                        TrainProName = $"Chương trình {(char)('A' + i)}", 
                        StartDate = DateTime.Now, 
                        EndDate = DateTime.Now.AddYears(4), 
                        NoCredits = 120, 
                        MajorId = majors[i].MajorId 
                    });
                }
                
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
                
                if (!programs.Any() || !cohorts.Any())
                {
                    throw new Exception("No training programs or cohorts found for ApplyTrainingProgram seeding");
                }

                var applys = new List<ApplyTrainingProgram>();
                var maxCount = Math.Min(programs.Count, cohorts.Count);
                
                for (int i = 0; i < maxCount; i++)
                {
                    applys.Add(new ApplyTrainingProgram 
                    { 
                        TrainProId = programs[i].TrainProId, 
                        CohortId = cohorts[i].CohortId 
                    });
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
                
                if (!subjects.Any() || !programs.Any())
                {
                    throw new Exception("No subjects or training programs found for SubjectTrainingProgram seeding");
                }

                var stps = new List<SubjectTrainingProgram>();
                var maxCount = Math.Min(subjects.Count, programs.Count);
                
                for (int i = 0; i < maxCount; i++)
                {
                    stps.Add(new SubjectTrainingProgram 
                    { 
                        SubjectId = subjects[i].SubjectId, 
                        TrainProId = programs[i].TrainProId 
                    });
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
                
                if (!stps.Any() || !subjects.Any())
                {
                    throw new Exception("No subject training programs or subjects found for PreconditionSubject seeding");
                }

                var preconditions = new List<PreconditionSubject>();
                var maxCount = Math.Min(stps.Count, subjects.Count);
                
                for (int i = 0; i < maxCount; i++)
                {
                    preconditions.Add(new PreconditionSubject 
                    { 
                        SubTrainingProgramId = stps[i].SubTrainProgramId, 
                        PreconditionSubjectId = subjects[(i+1) % subjects.Count].SubjectId 
                    });
                }
                
                await context.PreconditionSubjects.AddRangeAsync(preconditions);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedMultiExamsAsync(GessDbContext context)
        {
            if (!context.MultiExams.Any())
            {
                var teacherUser = context.Users.First(u => u.Email == "teacher1@example.com");
                
                // Lấy ID thực tế từ database
                var subject = context.Subjects.First(s => s.SubjectName == "Lập trình C#");
                var cateExam = context.CategoryExams.First(c => c.CategoryExamName == "Thi giữa kỳ");
                var semester = context.Semesters.First();
                var csharpClass = context.Classes.First(c => c.SubjectId == subject.SubjectId);
                
                var multiExams = new List<MultiExam>
                {
                    new MultiExam { MultiExamName = "Midterm 1", NumberQuestion = 10, Duration = 60, CreateAt = DateTime.Now, Status = "Published", CodeStart = "MID1", TeacherId = teacherUser.Id, SubjectId = subject.SubjectId, CategoryExamId = cateExam.CategoryExamId, SemesterId = semester.SemesterId, ClassId = csharpClass.ClassId, IsPublish = true },
                    new MultiExam { MultiExamName = "Midterm 2", NumberQuestion = 15, Duration = 70, CreateAt = DateTime.Now, Status = "Published", CodeStart = "MID2", TeacherId = teacherUser.Id, SubjectId = subject.SubjectId, CategoryExamId = cateExam.CategoryExamId, SemesterId = semester.SemesterId, ClassId = csharpClass.ClassId, IsPublish = true },
                    new MultiExam { MultiExamName = "Final 1", NumberQuestion = 20, Duration = 90, CreateAt = DateTime.Now, Status = "Published", CodeStart = "FIN1", TeacherId = teacherUser.Id, SubjectId = subject.SubjectId, CategoryExamId = cateExam.CategoryExamId, SemesterId = semester.SemesterId, ClassId = csharpClass.ClassId, IsPublish = true },
                    new MultiExam { MultiExamName = "Final 2", NumberQuestion = 25, Duration = 100, CreateAt = DateTime.Now, Status = "Published", CodeStart = "FIN2", TeacherId = teacherUser.Id, SubjectId = subject.SubjectId, CategoryExamId = cateExam.CategoryExamId, SemesterId = semester.SemesterId, ClassId = csharpClass.ClassId, IsPublish = true },
                    new MultiExam { MultiExamName = "Quiz", NumberQuestion = 5, Duration = 30, CreateAt = DateTime.Now, Status = "Published", CodeStart = "QUIZ", TeacherId = teacherUser.Id, SubjectId = subject.SubjectId, CategoryExamId = cateExam.CategoryExamId, SemesterId = semester.SemesterId, ClassId = csharpClass.ClassId, IsPublish = true }
                };
                await context.MultiExams.AddRangeAsync(multiExams);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedPracticeExamsAsync(GessDbContext context)
        {
            var teacherUser = context.Users.First(u => u.Email == "teacher1@example.com");
            var existingCount = context.PracticeExams.Count();
            var examsToAdd = new List<PracticeExam>();

            if (existingCount < 2)
            {
                // Lấy ID thực tế từ database
                var midtermCategory = context.CategoryExams.First(c => c.CategoryExamName == "Thi giữa kỳ");
                var finalCategory = context.CategoryExams.First(c => c.CategoryExamName == "Thi cuối kỳ");
                var csharpSubject = context.Subjects.First(s => s.SubjectName == "Lập trình C#");
                var semester = context.Semesters.First();
                var csharpClass = context.Classes.First(c => c.SubjectId == csharpSubject.SubjectId);

                if (existingCount == 0)
                {
                    examsToAdd.Add(new PracticeExam
                    {
                        PracExamName = "Kỳ thi giữa kỳ C# - Ca 1",
                        Duration = 90,
                        CreateAt = DateTime.Now,
                        Status = "Published",
                        CodeStart = "C#MID1",
                        TeacherId = teacherUser.Id,
                        CategoryExamId = midtermCategory.CategoryExamId,
                        SubjectId = csharpSubject.SubjectId,
                        SemesterId = semester.SemesterId,
                        ClassId = csharpClass.ClassId
                    });
                    examsToAdd.Add(new PracticeExam
                    {
                        PracExamName = "Kỳ thi cuối kỳ C# - Ca 1",
                        Duration = 120,
                        CreateAt = DateTime.Now,
                        Status = "Published",
                        CodeStart = "C#FINAL1",
                        TeacherId = teacherUser.Id,
                        CategoryExamId = finalCategory.CategoryExamId,
                        SubjectId = csharpSubject.SubjectId,
                        SemesterId = semester.SemesterId,
                        ClassId = csharpClass.ClassId
                    });
                }
                else if (existingCount == 1)
                {
                    // Lấy code đã có để không trùng
                    var existing = context.PracticeExams.First();
                    if (existing.CodeStart == "C#MID1")
                    {
                        examsToAdd.Add(new PracticeExam
                        {
                            PracExamName = "Kỳ thi cuối kỳ C# - Ca 1",
                            Duration = 120,
                            CreateAt = DateTime.Now,
                            Status = "Published",
                            CodeStart = "C#FINAL1",
                            TeacherId = teacherUser.Id,
                            CategoryExamId = finalCategory.CategoryExamId,
                            SubjectId = csharpSubject.SubjectId,
                            SemesterId = semester.SemesterId,
                            ClassId = csharpClass.ClassId
                        });
                    }
                    else
                    {
                        examsToAdd.Add(new PracticeExam
                        {
                            PracExamName = "Kỳ thi giữa kỳ C# - Ca 1",
                            Duration = 90,
                            CreateAt = DateTime.Now,
                            Status = "Published",
                            CodeStart = "C#MID1",
                            TeacherId = teacherUser.Id,
                            CategoryExamId = midtermCategory.CategoryExamId,
                            SubjectId = csharpSubject.SubjectId,
                            SemesterId = semester.SemesterId,
                            ClassId = csharpClass.ClassId
                        });
                    }
                }
                await context.PracticeExams.AddRangeAsync(examsToAdd);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedMultiQuestionsAsync(GessDbContext context)
        {
            if (!context.MultiQuestions.Any())
            {
                var teacherUser = context.Users.First(u => u.Email == "teacher1@example.com");
                
                // Lấy ID thực tế từ database
                var midtermCategory = context.CategoryExams.First(c => c.CategoryExamName == "Thi giữa kỳ");
                var finalCategory = context.CategoryExams.First(c => c.CategoryExamName == "Thi cuối kỳ");
                var easyLevel = context.LevelQuestions.First(l => l.LevelQuestionName == "Dễ");
                var mediumLevel = context.LevelQuestions.First(l => l.LevelQuestionName == "Trung bình");
                var hardLevel = context.LevelQuestions.First(l => l.LevelQuestionName == "Khó");
                var semester = context.Semesters.First();
                var chapter1 = context.Chapters.First(c => c.ChapterName == "Chương 1: Giới thiệu C#");
                var chapter2 = context.Chapters.First(c => c.ChapterName == "Chương 2: Cú pháp cơ bản");
                var chapter3 = context.Chapters.First(c => c.ChapterName == "Chương 3: Lập trình hướng đối tượng");
                
                var multiQuestions = new List<MultiQuestion>
                {
                    new MultiQuestion 
                    { 
                        Content = "Câu hỏi 1: Trong C#, từ khóa nào được sử dụng để khai báo một lớp?",
                        IsActive = true,
                        CreatedBy = teacherUser.Id,
                        IsPublic = true,
                        ChapterId = chapter1.ChapterId,
                        CategoryExamId = midtermCategory.CategoryExamId,
                        LevelQuestionId = easyLevel.LevelQuestionId,
                        SemesterId = semester.SemesterId
                    },
                    new MultiQuestion 
                    { 
                        Content = "Câu hỏi 2: Phương thức nào được gọi khi tạo một đối tượng mới trong C#?",
                        IsActive = true,
                        CreatedBy = teacherUser.Id,
                        IsPublic = true,
                        ChapterId = chapter1.ChapterId,
                        CategoryExamId = midtermCategory.CategoryExamId,
                        LevelQuestionId = mediumLevel.LevelQuestionId,
                        SemesterId = semester.SemesterId
                    },
                    new MultiQuestion 
                    { 
                        Content = "Câu hỏi 3: Interface trong C# có thể chứa phương thức có thân không?",
                        IsActive = true,
                        CreatedBy = teacherUser.Id,
                        IsPublic = true,
                        ChapterId = chapter2.ChapterId,
                        CategoryExamId = midtermCategory.CategoryExamId,
                        LevelQuestionId = mediumLevel.LevelQuestionId,
                        SemesterId = semester.SemesterId
                    },
                    new MultiQuestion 
                    { 
                        Content = "Câu hỏi 4: Từ khóa 'virtual' được sử dụng để làm gì trong C#?",
                        IsActive = true,
                        CreatedBy = teacherUser.Id,
                        IsPublic = true,
                        ChapterId = chapter2.ChapterId,
                        CategoryExamId = finalCategory.CategoryExamId,
                        LevelQuestionId = hardLevel.LevelQuestionId,
                        SemesterId = semester.SemesterId
                    },
                    new MultiQuestion 
                    { 
                        Content = "Câu hỏi 5: Exception handling trong C# sử dụng từ khóa nào?",
                        IsActive = true,
                        CreatedBy = teacherUser.Id,
                        IsPublic = true,
                        ChapterId = chapter3.ChapterId,
                        CategoryExamId = finalCategory.CategoryExamId,
                        LevelQuestionId = easyLevel.LevelQuestionId,
                        SemesterId = semester.SemesterId
                    }
                };
                await context.MultiQuestions.AddRangeAsync(multiQuestions);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedMultiAnswersAsync(GessDbContext context)
        {
            if (!context.MultiAnswers.Any())
            {
                // Lấy ID thực tế từ database
                var questions = context.MultiQuestions.ToList();
                
                if (!questions.Any())
                {
                    throw new Exception("No MultiQuestions found for MultiAnswers seeding");
                }

                var multiAnswers = new List<MultiAnswer>
                {
                    // Câu hỏi 1
                    new MultiAnswer { MultiQuestionId = questions[0].MultiQuestionId, AnswerContent = "class", IsCorrect = true },
                    new MultiAnswer { MultiQuestionId = questions[0].MultiQuestionId, AnswerContent = "struct", IsCorrect = false },
                    new MultiAnswer { MultiQuestionId = questions[0].MultiQuestionId, AnswerContent = "interface", IsCorrect = false },
                    new MultiAnswer { MultiQuestionId = questions[0].MultiQuestionId, AnswerContent = "enum", IsCorrect = false },
                    
                    // Câu hỏi 2
                    new MultiAnswer { MultiQuestionId = questions[1].MultiQuestionId, AnswerContent = "Constructor", IsCorrect = true },
                    new MultiAnswer { MultiQuestionId = questions[1].MultiQuestionId, AnswerContent = "Destructor", IsCorrect = false },
                    new MultiAnswer { MultiQuestionId = questions[1].MultiQuestionId, AnswerContent = "Method", IsCorrect = false },
                    new MultiAnswer { MultiQuestionId = questions[1].MultiQuestionId, AnswerContent = "Property", IsCorrect = false },
                    
                    // Câu hỏi 3
                    new MultiAnswer { MultiQuestionId = questions[2].MultiQuestionId, AnswerContent = "Không, chỉ chứa khai báo", IsCorrect = true },
                    new MultiAnswer { MultiQuestionId = questions[2].MultiQuestionId, AnswerContent = "Có, có thể chứa thân", IsCorrect = false },
                    new MultiAnswer { MultiQuestionId = questions[2].MultiQuestionId, AnswerContent = "Tùy thuộc vào phiên bản C#", IsCorrect = false },
                    new MultiAnswer { MultiQuestionId = questions[2].MultiQuestionId, AnswerContent = "Chỉ trong C# 8.0 trở lên", IsCorrect = false },
                    
                    // Câu hỏi 4
                    new MultiAnswer { MultiQuestionId = questions[3].MultiQuestionId, AnswerContent = "Cho phép override", IsCorrect = true },
                    new MultiAnswer { MultiQuestionId = questions[3].MultiQuestionId, AnswerContent = "Ngăn chặn override", IsCorrect = false },
                    new MultiAnswer { MultiQuestionId = questions[3].MultiQuestionId, AnswerContent = "Tạo phương thức tĩnh", IsCorrect = false },
                    new MultiAnswer { MultiQuestionId = questions[3].MultiQuestionId, AnswerContent = "Tạo phương thức private", IsCorrect = false },
                    
                    // Câu hỏi 5
                    new MultiAnswer { MultiQuestionId = questions[4].MultiQuestionId, AnswerContent = "try-catch", IsCorrect = true },
                    new MultiAnswer { MultiQuestionId = questions[4].MultiQuestionId, AnswerContent = "if-else", IsCorrect = false },
                    new MultiAnswer { MultiQuestionId = questions[4].MultiQuestionId, AnswerContent = "switch-case", IsCorrect = false },
                    new MultiAnswer { MultiQuestionId = questions[4].MultiQuestionId, AnswerContent = "for-while", IsCorrect = false }
                };
                await context.MultiAnswers.AddRangeAsync(multiAnswers);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedMultiExamHistoriesAsync(GessDbContext context)
        {
            if (!context.MultiExamHistories.Any())
            {
                var students = context.Students.Take(3).ToList();
                var multiExams = context.MultiExams.Take(3).ToList();
                
                if (students.Any() && multiExams.Any())
                {
                    var multiExamHistories = new List<MultiExamHistory>();
                    
                    // Create history for first student and exam
                    if (students.Count > 0 && multiExams.Count > 0)
                    {
                        multiExamHistories.Add(new MultiExamHistory 
                        { 
                            ExamHistoryId = Guid.NewGuid(),
                            MultiExamId = multiExams[0].MultiExamId, 
                            StudentId = students[0].StudentId, 
                            StartTime = DateTime.Now.AddHours(-2),
                            EndTime = DateTime.Now.AddHours(-1),
                            Score = 8.0,
                            CheckIn = true,
                            StatusExam = "Completed",
                            IsGrade = true
                        });
                    }
                    
                    // Create history for second student and exam
                    if (students.Count > 1 && multiExams.Count > 1)
                    {
                        multiExamHistories.Add(new MultiExamHistory 
                        { 
                            ExamHistoryId = Guid.NewGuid(),
                            MultiExamId = multiExams[1].MultiExamId, 
                            StudentId = students[1].StudentId, 
                            StartTime = DateTime.Now.AddHours(-1),
                            EndTime = DateTime.Now.AddMinutes(-30),
                            Score = 9.0,
                            CheckIn = true,
                            StatusExam = "Completed",
                            IsGrade = true
                        });
                    }
                    
                    // Create history for third student and exam
                    if (students.Count > 2 && multiExams.Count > 2)
                    {
                        multiExamHistories.Add(new MultiExamHistory 
                        { 
                            ExamHistoryId = Guid.NewGuid(),
                            MultiExamId = multiExams[2].MultiExamId, 
                            StudentId = students[2].StudentId, 
                            StartTime = DateTime.Now,
                            Score = null,
                            CheckIn = true,
                            StatusExam = "InProgress",
                            IsGrade = false
                        });
                    }
                    
                    if (multiExamHistories.Any())
                    {
                        await context.MultiExamHistories.AddRangeAsync(multiExamHistories);
                        await context.SaveChangesAsync();
                    }
                }
            }
        }

        private static async Task SeedQuestionMultiExamsAsync(GessDbContext context)
        {
            if (!context.QuestionMultiExams.Any())
            {
                var multiExamHistories = context.MultiExamHistories.Take(2).ToList();
                var multiQuestions = context.MultiQuestions.Take(3).ToList();
                
                if (multiExamHistories.Any() && multiQuestions.Any())
                {
                    var questionMultiExams = new List<QuestionMultiExam>();
                    
                    // Create question for first history and first question
                    if (multiExamHistories.Count > 0 && multiQuestions.Count > 0)
                    {
                        questionMultiExams.Add(new QuestionMultiExam 
                        { 
                            MultiExamHistoryId = multiExamHistories[0].ExamHistoryId,
                            MultiQuestionId = multiQuestions[0].MultiQuestionId,
                            QuestionOrder = 1,
                            Answer = "class",
                            Score = 1.0
                        });
                    }
                    
                    // Create question for first history and second question
                    if (multiExamHistories.Count > 0 && multiQuestions.Count > 1)
                    {
                        questionMultiExams.Add(new QuestionMultiExam 
                        { 
                            MultiExamHistoryId = multiExamHistories[0].ExamHistoryId,
                            MultiQuestionId = multiQuestions[1].MultiQuestionId,
                            QuestionOrder = 2,
                            Answer = "Constructor",
                            Score = 2.0
                        });
                    }
                    
                    // Create question for second history and third question
                    if (multiExamHistories.Count > 1 && multiQuestions.Count > 2)
                    {
                        questionMultiExams.Add(new QuestionMultiExam 
                        { 
                            MultiExamHistoryId = multiExamHistories[1].ExamHistoryId,
                            MultiQuestionId = multiQuestions[2].MultiQuestionId,
                            QuestionOrder = 1,
                            Answer = "Không, chỉ chứa khai báo",
                            Score = 2.0
                        });
                    }
                    
                    if (questionMultiExams.Any())
                    {
                        await context.QuestionMultiExams.AddRangeAsync(questionMultiExams);
                        await context.SaveChangesAsync();
                    }
                }
            }
        }

        private static async Task SeedPracticeExamHistoriesAsync(GessDbContext context)
        {
            if (!context.PracticeExamHistories.Any())
            {
                var students = context.Students.Take(3).ToList();
                var practiceExams = context.PracticeExams.Take(3).ToList();
                
                if (students.Any() && practiceExams.Any())
                {
                    var practiceExamHistories = new List<PracticeExamHistory>();
                    
                    // Create history for first student and exam
                    if (students.Count > 0 && practiceExams.Count > 0)
                    {
                        practiceExamHistories.Add(new PracticeExamHistory 
                        { 
                            PracExamHistoryId = Guid.NewGuid(),
                            PracExamId = practiceExams[0].PracExamId, 
                            StudentId = students[0].StudentId, 
                            StartTime = DateTime.Now.AddHours(-3),
                            EndTime = DateTime.Now.AddHours(-2),
                            Score = 8.5,
                            CheckIn = true,
                            StatusExam = "Completed",
                            IsGraded = true
                        });
                    }
                    
                    // Create history for second student and exam
                    if (students.Count > 1 && practiceExams.Count > 1)
                    {
                        practiceExamHistories.Add(new PracticeExamHistory 
                        { 
                            PracExamHistoryId = Guid.NewGuid(),
                            PracExamId = practiceExams[1].PracExamId, 
                            StudentId = students[1].StudentId, 
                            StartTime = DateTime.Now.AddHours(-1),
                            EndTime = DateTime.Now.AddMinutes(-30),
                            Score = 9.0,
                            CheckIn = true,
                            StatusExam = "Completed",
                            IsGraded = true
                        });
                    }
                    
                    // Create history for third student and exam
                    if (students.Count > 2 && practiceExams.Count > 2)
                    {
                        practiceExamHistories.Add(new PracticeExamHistory 
                        { 
                            PracExamHistoryId = Guid.NewGuid(),
                            PracExamId = practiceExams[2].PracExamId, 
                            StudentId = students[2].StudentId, 
                            StartTime = DateTime.Now,
                            Score = null,
                            CheckIn = true,
                            StatusExam = "InProgress",
                            IsGraded = false
                        });
                    }
                    
                    if (practiceExamHistories.Any())
                    {
                        await context.PracticeExamHistories.AddRangeAsync(practiceExamHistories);
                        await context.SaveChangesAsync();
                    }
                }
            }
        }

        private static async Task SeedQuestionPracExamsAsync(GessDbContext context)
        {
            if (!context.QuestionPracExams.Any())
            {
                var practiceExamHistories = context.PracticeExamHistories.Take(2).ToList();
                var practiceQuestions = context.PracticeQuestions.Take(2).ToList();
                
                if (practiceExamHistories.Any() && practiceQuestions.Any())
                {
                    var questionPracExams = new List<QuestionPracExam>();
                    
                    // Create question for first history and first question
                    if (practiceExamHistories.Count > 0 && practiceQuestions.Count > 0)
                    {
                        questionPracExams.Add(new QuestionPracExam 
                        { 
                            PracExamHistoryId = practiceExamHistories[0].PracExamHistoryId,
                            PracticeQuestionId = practiceQuestions[0].PracticeQuestionId,
                            Answer = "OOP là phương pháp lập trình dựa trên đối tượng...",
                            Score = 4.0
                        });
                    }
                    
                    // Create question for second history and second question
                    if (practiceExamHistories.Count > 1 && practiceQuestions.Count > 1)
                    {
                        questionPracExams.Add(new QuestionPracExam 
                        { 
                            PracExamHistoryId = practiceExamHistories[1].PracExamHistoryId,
                            PracticeQuestionId = practiceQuestions[1].PracticeQuestionId,
                            Answer = "Interface chỉ chứa khai báo, abstract class có thể chứa cả phương thức có thân...",
                            Score = 4.5
                        });
                    }
                    
                    if (questionPracExams.Any())
                    {
                        await context.QuestionPracExams.AddRangeAsync(questionPracExams);
                        await context.SaveChangesAsync();
                    }
                }
            }
        }
    }
}
