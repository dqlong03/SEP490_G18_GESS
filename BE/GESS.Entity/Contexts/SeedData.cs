//using GESS.Common;
//using GESS.Entity.Entities;
//using Microsoft.AspNetCore.Identity;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.Extensions.DependencyInjection;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace GESS.Entity.Contexts
//{
//    public static class SeedData
//    {
//        public static async Task InitializeAsync(IServiceProvider serviceProvider)
//        {
//            using var scope = serviceProvider.CreateScope();
//            var context = scope.ServiceProvider.GetRequiredService<GessDbContext>();
//            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
//            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

//            try
//            {
//                // 1. Tạo dữ liệu cơ bản không phụ thuộc
//                await SeedRolesAsync(roleManager);
//                await SeedUsersAsync(userManager);
//                await SeedMajorsAsync(context);
//                await SeedSemestersAsync(context);
//                await SeedCohortsAsync(context);

//                // 2. Tạo dữ liệu CategoryExam và Subject (cần thiết cho nhiều bảng khác)
//                await SeedCategoryExamDataAsync(context);

//                // 3. Tạo dữ liệu phụ thuộc vào User và Major
//                await SeedTeachersAsync(context);
//                await SeedStudentsAsync(context);

//                // 4. Tạo dữ liệu phụ thuộc vào Subject và Teacher
//                await SeedChaptersAsync(context);
//                await SeedClassesAsync(context);

//                // 5. Tạo dữ liệu phụ thuộc vào Class và Student
//                await SeedClassStudentsAsync(context);

//                // 6. Tạo dữ liệu LevelQuestion (cần thiết cho questions)
//                await SeedLevelQuestionsAsync(context);

//                // 7. Tạo dữ liệu cho phần thi tự luận (phụ thuộc vào CategoryExam, Subject, Chapter)
//                await SeedPracticeExamDataAsync(context);

//                // 8. Tạo dữ liệu Rooms (cần thiết cho ExamSlotRoom)
//                await SeedRoomsAsync(context);

//                // 9. Tạo dữ liệu TrainingPrograms (cần thiết cho ApplyTrainingProgram)
//                await SeedTrainingProgramsAsync(context);

//                // 10. Tạo dữ liệu ApplyTrainingProgram
//                await SeedApplyTrainingProgramsAsync(context);

//                // 11. Tạo dữ liệu phụ thuộc vào SubjectTrainingProgram
//                await SeedSubjectTrainingProgramsAsync(context);

//                // 12. Tạo dữ liệu phụ thuộc vào PreconditionSubject
//                await SeedPreconditionSubjectsAsync(context);

//                // 13. Tạo dữ liệu MultiExam
//                await SeedMultiExamsAsync(context);

//                // 14. Tạo dữ liệu PracticeExam
//                await SeedPracticeExamsAsync(context);

//                // 15. Tạo dữ liệu cho thi trắc nghiệm và tự luận của sinh viên
//                await SeedMultiQuestionsAsync(context);
//                await SeedMultiAnswersAsync(context);

//                // 16. Tạo dữ liệu cho phần thi trắc nghiệm (phụ thuộc vào ExamSlot, ExamSlotRoom, FinalExam, PracticeTestQuestion, NoQuestionInChapter, NoPEPaperInPE)
//                await SeedExamSlotsAsync(context);
//                await SeedExamSlotRoomsAsync(context);
//                await SeedFinalExamsAsync(context);
//                await SeedNoQuestionInChaptersAsync(context);

//                // 17. Tạo dữ liệu MultiExamHistories và PracticeExamHistories
//                await SeedMultiExamHistoriesAsync(context);
//                await SeedPracticeExamHistoriesAsync(context);

//                // 18. Tạo dữ liệu QuestionMultiExams và QuestionPracExams
//                await SeedQuestionMultiExamsAsync(context);
//                await SeedQuestionPracExamsAsync(context);

//                // 19. Tạo dữ liệu StudentExamSlotRooms (cuối cùng)
//                await SeedStudentExamSlotRoomsAsync(context);

//                // 20. Tạo dữ liệu bổ sung
//                await SeedAdditionalMultiExamHistoriesAsync(context);
//                await SeedAdditionalPracticeExamHistoriesAsync(context);
//                await SeedExamServicesAsync(context);
//                await SeedRefreshTokensAsync(context);
//            }
//            catch (Exception ex)
//            {
//                throw new Exception($"An error occurred while seeding the database: {ex.Message}", ex);
//            }
//        }

//        private static async Task SeedCohortsAsync(GessDbContext context)
//        {
//            if (!context.Cohorts.Any())
//            {
//                var cohorts = new List<Cohort>
//                {
//                    new Cohort { CohortName = "2020-2024" },
//                    new Cohort { CohortName = "2021-2025" },
//                    new Cohort { CohortName = "2022-2026" },
//                    new Cohort { CohortName = "2023-2027" },
//                    new Cohort { CohortName = "2024-2028" }
//                };
//                await context.Cohorts.AddRangeAsync(cohorts);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedRolesAsync(RoleManager<IdentityRole<Guid>> roleManager)
//        {
//            // ThaiNH_modified_UpdateMark&UserProfile_Begin
//            string[] roles = new[] { PredefinedRole.ADMIN_ROLE, PredefinedRole.HEADOFDEPARTMENT_ROLE, PredefinedRole.TEACHER_ROLE, PredefinedRole.EXAMINATION_ROLE, PredefinedRole.STUDENT_ROLE };
//            // ThaiNH_modified_UpdateMark&UserProfile_End
//            foreach (var role in roles)
//            {
//                if (!await roleManager.RoleExistsAsync(role))
//                {
//                    var roleResult = await roleManager.CreateAsync(new IdentityRole<Guid>
//                    {
//                        Id = Guid.NewGuid(),
//                        Name = role,
//                        NormalizedName = role.ToUpper()
//                    });

//                    if (!roleResult.Succeeded)
//                    {
//                        throw new Exception($"Failed to create role {role}: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
//                    }
//                }
//            }
//        }

//        private static async Task SeedUsersAsync(UserManager<User> userManager)
//        {
//            //ThaiNH_modified_UpdateMark&UserProfile_Begin
//            // Admin users
//            await CreateUser(userManager, "admin@example.com", "Nguyễn Văn A", "Password123!", "AM001", new DateTime(1980, 1, 1), "1234567890", true, PredefinedRole.ADMIN_ROLE);
//            await CreateUser(userManager, "admin2@example.com", "Trần Thị B", "Password123!", "AM002", new DateTime(1982, 3, 15), "1234567891", true, PredefinedRole.ADMIN_ROLE);

//            // Trưởng bộ môn
//            await CreateUser(userManager, "hod1@example.com", "Lê Văn C", "Password123!", "HOD001", new DateTime(1983, 5, 10), "0987654321", true, PredefinedRole.HEADOFDEPARTMENT_ROLE);
//            await CreateUser(userManager, "hod2@example.com", "Phạm Thị D", "Password123!", "HOD002", new DateTime(1984, 7, 20), "0987654322", false, PredefinedRole.HEADOFDEPARTMENT_ROLE);

//            // Giáo viên
//            await CreateUser(userManager, "teacher1@example.com", "Hoàng Văn E", "Password123!", "GV001", new DateTime(1985, 5, 10), "0987654323", true, PredefinedRole.TEACHER_ROLE);
//            await CreateUser(userManager, "teacher2@example.com", "Vũ Thị F", "Password123!", "GV002", new DateTime(1987, 7, 20), "0987654324", false, PredefinedRole.TEACHER_ROLE);
//            await CreateUser(userManager, "teacher3@example.com", "Đỗ Văn G", "Password123!", "GV003", new DateTime(1990, 9, 30), "0987654325", true, PredefinedRole.TEACHER_ROLE);
//            await CreateUser(userManager, "teacher4@example.com", "Ngô Văn H", "Password123!", "GV004", new DateTime(1988, 4, 15), "0987654326", true, PredefinedRole.TEACHER_ROLE);
//            await CreateUser(userManager, "teacher5@example.com", "Đặng Thị I", "Password123!", "GV005", new DateTime(1989, 6, 25), "0987654327", false, PredefinedRole.TEACHER_ROLE);

//            // Khảo thí
//            await CreateUser(userManager, "exam1@example.com", "Ngô Thị H", "Password123!", "EX001", new DateTime(1986, 6, 15), "0987654328", false, PredefinedRole.EXAMINATION_ROLE);
//            await CreateUser(userManager, "exam2@example.com", "Đặng Văn I", "Password123!", "EX002", new DateTime(1988, 8, 25), "0987654329", true, PredefinedRole.EXAMINATION_ROLE);
//            await CreateUser(userManager, "tuanvahe140809@fpt.edu.vn", "Đặng Văn I", "Password123!", "EX003", new DateTime(1988, 8, 25), "0987654329", true, PredefinedRole.EXAMINATION_ROLE);

//            // Sinh viên
//            await CreateUser(userManager, "thainhhe171983@fpt.edu.vn", "Nguyễn Huy Thái", "Password123!", "SD001", new DateTime(2000, 8, 15), "0123456789", true, PredefinedRole.STUDENT_ROLE);
//            await CreateUser(userManager, "student2@example.com", "Hoàng Anh K", "Password123!", "SD002", new DateTime(2001, 9, 20), "0123456790", false, PredefinedRole.STUDENT_ROLE);
//            await CreateUser(userManager, "student3@example.com", "Vũ Thị L", "Password123!", "SD003", new DateTime(2002, 10, 25), "0123456791", true, PredefinedRole.STUDENT_ROLE);
//            await CreateUser(userManager, "student4@example.com", "Trần Văn M", "Password123!", "SD004", new DateTime(2000, 7, 10), "0123456792", true, PredefinedRole.STUDENT_ROLE);
//            await CreateUser(userManager, "student5@example.com", "Lê Thị N", "Password123!", "SD005", new DateTime(2001, 11, 5), "0123456793", false, PredefinedRole.STUDENT_ROLE);
//            await CreateUser(userManager, "student6@example.com", "Nguyễn Văn O", "Password123!", "SD006", new DateTime(2002, 3, 15), "0123456794", true, PredefinedRole.STUDENT_ROLE);
//            await CreateUser(userManager, "student7@example.com", "Phạm Thị P", "Password123!", "SD007", new DateTime(2000, 5, 20), "0123456795", false, PredefinedRole.STUDENT_ROLE);
//            await CreateUser(userManager, "student8@example.com", "Hoàng Văn Q", "Password123!", "SD008", new DateTime(2001, 12, 30), "0123456796", true, PredefinedRole.STUDENT_ROLE);
//            //ThaiNH_modified_UpdateMark&UserProfile_End
//        }

//        private static async Task SeedMajorsAsync(GessDbContext context)
//        {
//            if (!context.Majors.Any())
//            {
//                var majors = new List<Major>
//                {
//                    new Major { MajorName = "CNTT", StartDate = DateTime.Now, IsActive = true },
//                    new Major { MajorName = "Điện tử", StartDate = DateTime.Now, IsActive = true },
//                    new Major { MajorName = "Cơ khí", StartDate = DateTime.Now, IsActive = true },
//                    new Major { MajorName = "Kinh tế", StartDate = DateTime.Now, IsActive = true },
//                    new Major { MajorName = "Xây dựng", StartDate = DateTime.Now, IsActive = true }
//                };
//                await context.Majors.AddRangeAsync(majors);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedSemestersAsync(GessDbContext context)
//        {
//            if (!context.Semesters.Any())
//            {
//                var semesters = new List<Semester>
//                {
//                    new Semester
//                    {
//                        SemesterName = "Học kỳ 1 năm 2023-2024",
//                        IsActive = true
//                        //StartDate = new DateTime(2023, 9, 1),
//                        //EndDate = new DateTime(2024, 1, 15)
//                    },
//                    new Semester
//                    {
//                        SemesterName = "Học kỳ 2 năm 2023-2024",
//                        IsActive = true
//                        //StartDate = new DateTime(2024, 2, 1),
//                        //EndDate = new DateTime(2024, 6, 15)
//                    }
//                };
//                await context.Semesters.AddRangeAsync(semesters);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedSubjectsAsync(GessDbContext context)
//        {
//            if (!context.Subjects.Any())
//            {
//                var subjects = new List<Subject>
//                {
//                    new Subject { SubjectName = "Lập trình C#", Description = "Môn học lập trình", Course = "CS101", NoCredits = 3 },
//                    new Subject { SubjectName = "Cơ sở dữ liệu", Description = "Môn học CSDL", Course = "DB101", NoCredits = 3 },
//                    new Subject { SubjectName = "Mạng máy tính", Description = "Môn học mạng", Course = "NET101", NoCredits = 3 },
//                    new Subject { SubjectName = "Toán rời rạc", Description = "Môn học toán", Course = "MATH101", NoCredits = 3 },
//                    new Subject { SubjectName = "Kỹ năng mềm", Description = "Môn học kỹ năng", Course = "SOFT101", NoCredits = 2 }
//                };
//                await context.Subjects.AddRangeAsync(subjects);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedChaptersAsync(GessDbContext context)
//        {
//            if (!context.Chapters.Any())
//            {
//                // Kiểm tra dữ liệu cần thiết
//                if (!context.Subjects.Any())
//                {
//                    throw new Exception("No Subjects found. Please seed Subjects first.");
//                }
//                if (!context.Subjects.Any(s => s.SubjectName == "Lập trình C#"))
//                {
//                    throw new Exception("Subject 'Lập trình C#' not found. Please seed Subjects first.");
//                }

//                // Lấy SubjectId thực tế từ database
//                var csharpSubject = context.Subjects.First(s => s.SubjectName == "Lập trình C#");

//                var chapters = new List<Chapter>
//                {
//                    new Chapter
//                    {
//                        ChapterName = "Chương 1: Giới thiệu C#",
//                        Description = "Chương mở đầu về C#",
//                        SubjectId = csharpSubject.SubjectId
//                    },
//                    new Chapter
//                    {
//                        ChapterName = "Chương 2: Cú pháp cơ bản",
//                        Description = "Chương về cú pháp cơ bản C#",
//                        SubjectId = csharpSubject.SubjectId
//                    },
//                    new Chapter
//                    {
//                        ChapterName = "Chương 3: Lập trình hướng đối tượng",
//                        Description = "Chương về OOP trong C#",
//                        SubjectId = csharpSubject.SubjectId
//                    }
//                };
//                await context.Chapters.AddRangeAsync(chapters);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedClassesAsync(GessDbContext context)
//        {
//            if (!context.Classes.Any())
//            {
//                // Kiểm tra dữ liệu cần thiết
//                if (!context.Semesters.Any())
//                {
//                    throw new Exception("No Semesters found. Please seed Semesters first.");
//                }
//                if (!context.Subjects.Any())
//                {
//                    throw new Exception("No Subjects found. Please seed Subjects first.");
//                }
//                if (!context.Users.Any(u => u.Email == "teacher1@example.com"))
//                {
//                    throw new Exception("Teacher1 not found. Please seed Users first.");
//                }
//                if (!context.Users.Any(u => u.Email == "teacher2@example.com"))
//                {
//                    throw new Exception("Teacher2 not found. Please seed Users first.");
//                }
//                if (!context.Users.Any(u => u.Email == "teacher3@example.com"))
//                {
//                    throw new Exception("Teacher3 not found. Please seed Users first.");
//                }

//                // Lấy ID thực tế từ database
//                var semester = context.Semesters.First();
//                var subject1 = context.Subjects.First(s => s.SubjectName == "Lập trình C#");
//                var subject2 = context.Subjects.First(s => s.SubjectName == "Cơ sở dữ liệu");
//                var subject3 = context.Subjects.First(s => s.SubjectName == "Mạng máy tính");

//                var classes = new List<Class>
//                {
//                    new Class
//                    {
//                        ClassName = "Lập trình C# - Nhóm 1",
//                        SubjectId = subject1.SubjectId,
//                        TeacherId = context.Users.First(u => u.Email == "teacher1@example.com").Id,
//                        SemesterId = semester.SemesterId
//                    },
//                    new Class
//                    {
//                        ClassName = "Cơ sở dữ liệu - Nhóm 1",
//                        SubjectId = subject2.SubjectId,
//                        TeacherId = context.Users.First(u => u.Email == "teacher2@example.com").Id,
//                        SemesterId = semester.SemesterId
//                    },
//                    new Class
//                    {
//                        ClassName = "Mạng máy tính - Nhóm 1",
//                        SubjectId = subject3.SubjectId,
//                        TeacherId = context.Users.First(u => u.Email == "teacher3@example.com").Id,
//                        SemesterId = semester.SemesterId
//                    }
//                };
//                await context.Classes.AddRangeAsync(classes);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedTeachersAsync(GessDbContext context)
//        {
//            if (!context.Teachers.Any())
//            {
//                // Kiểm tra dữ liệu cần thiết
//                if (!context.Majors.Any())
//                {
//                    throw new Exception("No Majors found. Please seed Majors first.");
//                }
//                if (!context.Users.Any(u => u.Email == "teacher1@example.com"))
//                {
//                    throw new Exception("Teacher1 not found. Please seed Users first.");
//                }
//                if (!context.Users.Any(u => u.Email == "teacher2@example.com"))
//                {
//                    throw new Exception("Teacher2 not found. Please seed Users first.");
//                }
//                if (!context.Users.Any(u => u.Email == "teacher3@example.com"))
//                {
//                    throw new Exception("Teacher3 not found. Please seed Users first.");
//                }
//                if (!context.Users.Any(u => u.Email == "teacher4@example.com"))
//                {
//                    throw new Exception("Teacher4 not found. Please seed Users first.");
//                }
//                if (!context.Users.Any(u => u.Email == "teacher5@example.com"))
//                {
//                    throw new Exception("Teacher5 not found. Please seed Users first.");
//                }

//                // Lấy MajorId thực tế từ database
//                var majorCNTT = context.Majors.First(m => m.MajorName == "CNTT");
//                var majorDienTu = context.Majors.First(m => m.MajorName == "Điện tử");
//                var majorCoKhi = context.Majors.First(m => m.MajorName == "Cơ khí");

//                var teachers = new List<Teacher>
//                {
//                    new Teacher
//                    {
//                        TeacherId = context.Users.First(u => u.Email == "teacher1@example.com").Id,
//                        UserId = context.Users.First(u => u.Email == "teacher1@example.com").Id,
//                        HireDate = new DateTime(2020, 9, 1),
//                        MajorId = majorCNTT.MajorId
//                    },
//                    new Teacher
//                    {
//                        TeacherId = context.Users.First(u => u.Email == "teacher2@example.com").Id,
//                        UserId = context.Users.First(u => u.Email == "teacher2@example.com").Id,
//                        HireDate = new DateTime(2021, 9, 1),
//                        MajorId = majorCNTT.MajorId
//                    },
//                    new Teacher
//                    {
//                        TeacherId = context.Users.First(u => u.Email == "teacher3@example.com").Id,
//                        UserId = context.Users.First(u => u.Email == "teacher3@example.com").Id,
//                        HireDate = new DateTime(2022, 9, 1),
//                        MajorId = majorDienTu.MajorId
//                    },
//                    new Teacher
//                    {
//                        TeacherId = context.Users.First(u => u.Email == "teacher4@example.com").Id,
//                        UserId = context.Users.First(u => u.Email == "teacher4@example.com").Id,
//                        HireDate = new DateTime(2023, 9, 1),
//                        MajorId = majorDienTu.MajorId
//                    },
//                    new Teacher
//                    {
//                        TeacherId = context.Users.First(u => u.Email == "teacher5@example.com").Id,
//                        UserId = context.Users.First(u => u.Email == "teacher5@example.com").Id,
//                        HireDate = new DateTime(2023, 9, 1),
//                        MajorId = majorCoKhi.MajorId
//                    }
//                };
//                await context.Teachers.AddRangeAsync(teachers);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedStudentsAsync(GessDbContext context)
//        {
//            if (!context.Students.Any())
//            {
//                var cohortId = context.Cohorts.First().CohortId;
//                var students = new List<Student>
//                {
//                    new Student
//                    {
//                        StudentId = context.Users.First(u => u.Email == "thainhhe171983@fpt.edu.vn").Id,
//                        UserId = context.Users.First(u => u.Email == "thainhhe171983@fpt.edu.vn").Id,
//                        CohortId = cohortId,
//                        EnrollDate = new DateTime(2023, 9, 1),
//                        AvatarURL = "/images/avatars/student1.jpg"
//                    },
//                    new Student
//                    {
//                        StudentId = context.Users.First(u => u.Email == "student2@example.com").Id,
//                        UserId = context.Users.First(u => u.Email == "student2@example.com").Id,
//                        CohortId = cohortId,
//                        EnrollDate = new DateTime(2023, 9, 1),
//                        AvatarURL = "/images/avatars/student2.jpg"
//                    },
//                    new Student
//                    {
//                        StudentId = context.Users.First(u => u.Email == "student3@example.com").Id,
//                        UserId = context.Users.First(u => u.Email == "student3@example.com").Id,
//                        CohortId = cohortId,
//                        EnrollDate = new DateTime(2023, 9, 1),
//                        AvatarURL = "/images/avatars/student3.jpg"
//                    },
//                    new Student
//                    {
//                        StudentId = context.Users.First(u => u.Email == "student4@example.com").Id,
//                        UserId = context.Users.First(u => u.Email == "student4@example.com").Id,
//                        CohortId = cohortId,
//                        EnrollDate = new DateTime(2023, 9, 1),
//                        AvatarURL = "/images/avatars/student4.jpg"
//                    },
//                    new Student
//                    {
//                        StudentId = context.Users.First(u => u.Email == "student5@example.com").Id,
//                        UserId = context.Users.First(u => u.Email == "student5@example.com").Id,
//                        CohortId = cohortId,
//                        EnrollDate = new DateTime(2023, 9, 1),
//                        AvatarURL = "/images/avatars/student5.jpg"
//                    },
//                    new Student
//                    {
//                        StudentId = context.Users.First(u => u.Email == "student6@example.com").Id,
//                        UserId = context.Users.First(u => u.Email == "student6@example.com").Id,
//                        CohortId = cohortId,
//                        EnrollDate = new DateTime(2023, 9, 1),
//                        AvatarURL = "/images/avatars/student6.jpg"
//                    },
//                    new Student
//                    {
//                        StudentId = context.Users.First(u => u.Email == "student7@example.com").Id,
//                        UserId = context.Users.First(u => u.Email == "student7@example.com").Id,
//                        CohortId = cohortId,
//                        EnrollDate = new DateTime(2023, 9, 1),
//                        AvatarURL = "/images/avatars/student7.jpg"
//                    },
//                    new Student
//                    {
//                        StudentId = context.Users.First(u => u.Email == "student8@example.com").Id,
//                        UserId = context.Users.First(u => u.Email == "student8@example.com").Id,
//                        CohortId = cohortId,
//                        EnrollDate = new DateTime(2023, 9, 1),
//                        AvatarURL = "/images/avatars/student8.jpg"
//                    }
//                };
//                await context.Students.AddRangeAsync(students);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedClassStudentsAsync(GessDbContext context)
//        {
//            if (!context.ClassStudents.Any())
//            {
//                var classStudents = new List<ClassStudent>();
//                var students = context.Students.ToList();
//                var classes = context.Classes.ToList();

//                foreach (var student in students)
//                {
//                    // Gán mỗi student vào 2 lớp ngẫu nhiên
//                    var randomClasses = classes.OrderBy(x => Guid.NewGuid()).Take(2);
//                    foreach (var classItem in randomClasses)
//                    {
//                        classStudents.Add(new ClassStudent
//                        {
//                            StudentId = student.StudentId,
//                            ClassId = classItem.ClassId
//                        });
//                    }
//                }

//                await context.ClassStudents.AddRangeAsync(classStudents);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task CreateUser(
//            UserManager<User> userManager,
//            string email,
//            string fullName,
//            string password,
//            string code,
//            DateTime dateOfBirth,
//            string phoneNumber,
//            bool gender,
//            string role)
//        {
//            if (await userManager.FindByEmailAsync(email) == null)
//            {
//                var user = new User
//                {
//                    UserName = email,
//                    Email = email,
//                    Fullname = fullName,
//                    // ThaiNH_add_UpdateMark&UserProfile_Begin
//                    Code = code,
//                    // ThaiNH_add_UpdateMark&UserProfile_End
//                    DateOfBirth = dateOfBirth,
//                    PhoneNumber = phoneNumber,
//                    Gender = gender,
//                    EmailConfirmed = true
//                };

//                var result = await userManager.CreateAsync(user, password);
//                if (result.Succeeded)
//                {
//                    await userManager.AddToRoleAsync(user, role);
//                }
//                else
//                {
//                    throw new Exception($"Failed to create user {email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
//                }
//            }
//        }

//        private static async Task SeedPracticeExamDataAsync(GessDbContext context)
//        {
//            // 1. Seed PracticeQuestions
//            if (!context.PracticeQuestions.Any())
//            {
//                var teacherUser = context.Users.First(u => u.Email == "teacher1@example.com");

//                // Lấy ID thực tế từ database
//                var midtermCategory = context.CategoryExams.First(c => c.CategoryExamName == "Thi giữa kỳ");
//                var finalCategory = context.CategoryExams.First(c => c.CategoryExamName == "Thi cuối kỳ");
//                var easyLevel = context.LevelQuestions.First(l => l.LevelQuestionName == "Dễ");
//                var mediumLevel = context.LevelQuestions.First(l => l.LevelQuestionName == "Trung bình");
//                var semester = context.Semesters.First();
//                var chapter1 = context.Chapters.First(c => c.ChapterName == "Chương 1: Giới thiệu C#");
//                var chapter2 = context.Chapters.First(c => c.ChapterName == "Chương 2: Cú pháp cơ bản");

//                var practiceQuestions = new List<PracticeQuestion>
//                {
//                    new PracticeQuestion
//                    {
//                        Content = "Câu hỏi 1: Giải thích khái niệm về lập trình hướng đối tượng trong C#",
//                        CategoryExamId = midtermCategory.CategoryExamId,
//                        LevelQuestionId = easyLevel.LevelQuestionId,
//                        SemesterId = semester.SemesterId,
//                        ChapterId = chapter1.ChapterId,
//                        IsActive = true,
//                        CreatedBy = teacherUser.Id,
//                        IsPublic = true,
//                        PracticeAnswer = new PracticeAnswer
//                        {
//                            AnswerContent = "OOP là phương pháp lập trình dựa trên đối tượng..."
//                        }
//                    },
//                    new PracticeQuestion
//                    {
//                        Content = "Câu hỏi 2: Phương thức nào được gọi khi tạo một đối tượng mới trong C#?",
//                        CategoryExamId = finalCategory.CategoryExamId,
//                        LevelQuestionId = mediumLevel.LevelQuestionId,
//                        SemesterId = semester.SemesterId,
//                        ChapterId = chapter2.ChapterId,
//                        IsActive = true,
//                        CreatedBy = teacherUser.Id,
//                        IsPublic = true,
//                        PracticeAnswer = new PracticeAnswer
//                        {
//                            AnswerContent = "Interface chỉ chứa khai báo, abstract class có thể chứa cả phương thức có thân..."
//                        }
//                    }
//                };
//                await context.PracticeQuestions.AddRangeAsync(practiceQuestions);
//                await context.SaveChangesAsync();
//            }

//            // 2. Seed PracticeExamPapers
//            if (!context.PracticeExamPapers.Any())
//            {
//                var teacherUser = context.Users.First(u => u.Email == "teacher1@example.com");

//                // Lấy ID thực tế từ database
//                var midtermCategory = context.CategoryExams.First(c => c.CategoryExamName == "Thi giữa kỳ");
//                var finalCategory = context.CategoryExams.First(c => c.CategoryExamName == "Thi cuối kỳ");
//                var csharpSubject = context.Subjects.First(s => s.SubjectName == "Lập trình C#");
//                var semester = context.Semesters.First();

//                var practiceExamPapers = new List<PracticeExamPaper>
//                {
//                    new PracticeExamPaper
//                    {
//                        PracExamPaperName = "Đề thi giữa kỳ C# - Đề 1",
//                        NumberQuestion = 1,
//                        CreateAt = DateTime.Now,
//                        Status = "Published",
//                        TeacherId = teacherUser.Id,
//                        CategoryExamId = midtermCategory.CategoryExamId,
//                        SubjectId = csharpSubject.SubjectId,
//                        SemesterId = semester.SemesterId
//                    },
//                    new PracticeExamPaper
//                    {
//                        PracExamPaperName = "Đề thi cuối kỳ C# - Đề 1",
//                        NumberQuestion = 1,
//                        CreateAt = DateTime.Now,
//                        Status = "Published",
//                        TeacherId = teacherUser.Id,
//                        CategoryExamId = finalCategory.CategoryExamId,
//                        SubjectId = csharpSubject.SubjectId,
//                        SemesterId = semester.SemesterId
//                    }
//                };
//                await context.PracticeExamPapers.AddRangeAsync(practiceExamPapers);
//                await context.SaveChangesAsync();
//            }

//            // 3. Lấy lại ID thực tế
//            var practiceQuestionsList = await context.PracticeQuestions.ToListAsync();
//            var practiceExamPapersList = await context.PracticeExamPapers.ToListAsync();

//            // 4. Seed PracticeTestQuestions
//            if (!context.PracticeTestQuestions.Any())
//            {
//                var practiceTestQuestions = new List<PracticeTestQuestion>
//                {
//                    new PracticeTestQuestion
//                    {
//                        PracExamPaperId = practiceExamPapersList[0].PracExamPaperId,
//                        PracticeQuestionId = practiceQuestionsList[0].PracticeQuestionId,
//                        QuestionOrder = 1,
//                        Score = 5.0
//                    },
//                    new PracticeTestQuestion
//                    {
//                        PracExamPaperId = practiceExamPapersList[1].PracExamPaperId,
//                        PracticeQuestionId = practiceQuestionsList[1].PracticeQuestionId,
//                        QuestionOrder = 1,
//                        Score = 5.0
//                    }
//                };
//                await context.PracticeTestQuestions.AddRangeAsync(practiceTestQuestions);
//                await context.SaveChangesAsync();
//            }

//            // 5. Seed PracticeExam
//            if (!context.PracticeExams.Any())
//            {
//                var teacherUser = context.Users.First(u => u.Email == "teacher1@example.com");

//                // Lấy ID thực tế từ database
//                var midtermCategory = context.CategoryExams.First(c => c.CategoryExamName == "Thi giữa kỳ");
//                var finalCategory = context.CategoryExams.First(c => c.CategoryExamName == "Thi cuối kỳ");
//                var csharpSubject = context.Subjects.First(s => s.SubjectName == "Lập trình C#");
//                var semester = context.Semesters.First();
//                var csharpClass = context.Classes.First(c => c.SubjectId == csharpSubject.SubjectId);

//                var practiceExams = new List<PracticeExam>
//                {
//                    new PracticeExam
//                    {
//                        PracExamName = "Kỳ thi giữa kỳ C# - Ca 1",
//                        Duration = 90,
//                        CreateAt = DateTime.Now,
//                        Status = "Published",
//                        CodeStart = "C#MID1",
//                        TeacherId = teacherUser.Id,
//                        CategoryExamId = midtermCategory.CategoryExamId,
//                        SubjectId = csharpSubject.SubjectId,
//                        SemesterId = semester.SemesterId,
//                        ClassId = csharpClass.ClassId
//                    },
//                    new PracticeExam
//                    {
//                        PracExamName = "Kỳ thi cuối kỳ C# - Ca 1",
//                        Duration = 120,
//                        CreateAt = DateTime.Now,
//                        Status = "Published",
//                        CodeStart = "C#FINAL1",
//                        TeacherId = teacherUser.Id,
//                        CategoryExamId = finalCategory.CategoryExamId,
//                        SubjectId = csharpSubject.SubjectId,
//                        SemesterId = semester.SemesterId,
//                        ClassId = csharpClass.ClassId
//                    }
//                };
//                await context.PracticeExams.AddRangeAsync(practiceExams);
//                await context.SaveChangesAsync();
//            }

//            // 6. Seed NoPEPaperInPE
//            if (!context.NoPEPaperInPEs.Any())
//            {
//                var practiceExams = await context.PracticeExams.ToListAsync();
//                var practiceExamPapers = await context.PracticeExamPapers.ToListAsync();

//                if (!practiceExams.Any() || !practiceExamPapers.Any())
//                {
//                    throw new Exception("Required data for NoPEPaperInPE seeding is missing");
//                }

//                // Kiểm tra có đủ dữ liệu không
//                if (practiceExams.Count < 2 || practiceExamPapers.Count < 2)
//                {
//                    throw new Exception($"Insufficient data: PracticeExams count: {practiceExams.Count}, PracticeExamPapers count: {practiceExamPapers.Count}");
//                }

//                var noPEPaperInPEs = new List<NoPEPaperInPE>();

//                // Tạo liên kết cho tất cả practice exams và papers có sẵn
//                for (int i = 0; i < Math.Min(practiceExams.Count, practiceExamPapers.Count); i++)
//                {
//                    noPEPaperInPEs.Add(new NoPEPaperInPE
//                    {
//                        PracExamId = practiceExams[i].PracExamId,
//                        PracExamPaperId = practiceExamPapers[i].PracExamPaperId
//                    });
//                }

//                await context.NoPEPaperInPEs.AddRangeAsync(noPEPaperInPEs);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedCategoryExamDataAsync(GessDbContext context)
//        {
//            try
//            {
//                // 1. Seed CategoryExam
//                if (!context.CategoryExams.Any())
//                {
//                    var categoryExamList = new List<CategoryExam>
//                    {
//                        new CategoryExam { CategoryExamName = "Thi giữa kỳ" },
//                        new CategoryExam { CategoryExamName = "Thi cuối kỳ" },
//                        new CategoryExam { CategoryExamName = "Thi thử" },
//                        new CategoryExam { CategoryExamName = "Thi kiểm tra" },
//                        new CategoryExam { CategoryExamName = "Thi đánh giá năng lực" }
//                    };
//                    await context.CategoryExams.AddRangeAsync(categoryExamList);
//                    await context.SaveChangesAsync();
//                }

//                // 2. Seed Subjects
//                if (!context.Subjects.Any())
//                {
//                    var subjectList = new List<Subject>
//                    {
//                        new Subject
//                        {
//                            SubjectName = "Lập trình C#",
//                            Description = "Môn học về lập trình C# cơ bản đến nâng cao",
//                            Course = "CS101",
//                            NoCredits = 3
//                        },
//                        new Subject
//                        {
//                            SubjectName = "Cơ sở dữ liệu",
//                            Description = "Môn học về thiết kế và quản lý cơ sở dữ liệu",
//                            Course = "CS102",
//                            NoCredits = 3
//                        },
//                        new Subject
//                        {
//                            SubjectName = "Mạng máy tính",
//                            Description = "Môn học về nguyên lý và ứng dụng mạng máy tính",
//                            Course = "CS103",
//                            NoCredits = 3
//                        }
//                    };
//                    await context.Subjects.AddRangeAsync(subjectList);
//                    await context.SaveChangesAsync();
//                }

//                // 3. Verify that both CategoryExam and Subject data exist and get their IDs
//                var existingCategoryExams = await context.CategoryExams.ToListAsync();
//                var existingSubjects = await context.Subjects.ToListAsync();

//                if (!existingCategoryExams.Any() || !existingSubjects.Any())
//                {
//                    throw new Exception("Failed to seed CategoryExam or Subject data");
//                }

//                // 4. Seed CategoryExamSubject using actual IDs from the database
//                if (!context.CategoryExamSubjects.Any())
//                {
//                    var categoryExamSubjects = new List<CategoryExamSubject>();

//                    // Lấy các loại thi
//                    var midtermExam = existingCategoryExams.FirstOrDefault(c => c.CategoryExamName == "Thi giữa kỳ");
//                    var finalExam = existingCategoryExams.FirstOrDefault(c => c.CategoryExamName == "Thi cuối kỳ");
//                    var practiceExam = existingCategoryExams.FirstOrDefault(c => c.CategoryExamName == "Thi thử");
//                    var testExam = existingCategoryExams.FirstOrDefault(c => c.CategoryExamName == "Thi kiểm tra");
//                    var assessmentExam = existingCategoryExams.FirstOrDefault(c => c.CategoryExamName == "Thi đánh giá năng lực");

//                    if (midtermExam == null || finalExam == null || practiceExam == null || testExam == null || assessmentExam == null)
//                    {
//                        throw new Exception("One or more CategoryExam types are missing");
//                    }

//                    // Lấy các môn học
//                    var csharpSubject = existingSubjects.FirstOrDefault(s => s.SubjectName == "Lập trình C#");
//                    var dbSubject = existingSubjects.FirstOrDefault(s => s.SubjectName == "Cơ sở dữ liệu");
//                    var networkSubject = existingSubjects.FirstOrDefault(s => s.SubjectName == "Mạng máy tính");

//                    if (csharpSubject == null || dbSubject == null || networkSubject == null)
//                    {
//                        throw new Exception("One or more Subjects are missing");
//                    }

//                    // Lập trình C#
//                    categoryExamSubjects.Add(new CategoryExamSubject
//                    {
//                        CategoryExamId = midtermExam.CategoryExamId,
//                        SubjectId = csharpSubject.SubjectId,
//                        GradeComponent = 30.0m,
//                        IsDelete = false
//                    });
//                    categoryExamSubjects.Add(new CategoryExamSubject
//                    {
//                        CategoryExamId = finalExam.CategoryExamId,
//                        SubjectId = csharpSubject.SubjectId,
//                        GradeComponent = 70.0m,
//                        IsDelete = false
//                    });

//                    // Cơ sở dữ liệu
//                    categoryExamSubjects.Add(new CategoryExamSubject
//                    {
//                        CategoryExamId = midtermExam.CategoryExamId,
//                        SubjectId = dbSubject.SubjectId,
//                        GradeComponent = 30.0m,
//                        IsDelete = false
//                    });
//                    categoryExamSubjects.Add(new CategoryExamSubject
//                    {
//                        CategoryExamId = finalExam.CategoryExamId,
//                        SubjectId = dbSubject.SubjectId,
//                        GradeComponent = 50.0m,
//                        IsDelete = false
//                    });
//                    categoryExamSubjects.Add(new CategoryExamSubject
//                    {
//                        CategoryExamId = practiceExam.CategoryExamId,
//                        SubjectId = dbSubject.SubjectId,
//                        GradeComponent = 20.0m,
//                        IsDelete = false
//                    });

//                    // Mạng máy tính
//                    categoryExamSubjects.Add(new CategoryExamSubject
//                    {
//                        CategoryExamId = midtermExam.CategoryExamId,
//                        SubjectId = networkSubject.SubjectId,
//                        GradeComponent = 25.0m,
//                        IsDelete = false
//                    });
//                    categoryExamSubjects.Add(new CategoryExamSubject
//                    {
//                        CategoryExamId = finalExam.CategoryExamId,
//                        SubjectId = networkSubject.SubjectId,
//                        GradeComponent = 65.0m,
//                        IsDelete = false
//                    });
//                    categoryExamSubjects.Add(new CategoryExamSubject
//                    {
//                        CategoryExamId = testExam.CategoryExamId,
//                        SubjectId = networkSubject.SubjectId,
//                        GradeComponent = 10.0m,
//                        IsDelete = false
//                    });

//                    await context.CategoryExamSubjects.AddRangeAsync(categoryExamSubjects);
//                    await context.SaveChangesAsync();
//                }
//            }
//            catch (Exception ex)
//            {
//                throw new Exception($"Error seeding CategoryExam data: {ex.Message}", ex);
//            }
//        }

//        private static async Task SeedExamSlotsAsync(GessDbContext context)
//        {
//            if (!context.ExamSlots.Any())
//            {
//                var examSlots = new List<ExamSlot>
//                {
//                    // Ca sáng
//                     new ExamSlot
//            {
//                SlotName = "Ca 1",
//                StartTime = new TimeSpan(7, 30, 0),
//                EndTime = new TimeSpan(9, 0, 0)
//            },
//            new ExamSlot
//            {
//                SlotName = "Ca 2",
//                StartTime = new TimeSpan(9, 10, 0),
//                EndTime = new TimeSpan(10, 40, 0)
//            },
//            new ExamSlot
//            {
//                SlotName = "Ca 3",
//                StartTime = new TimeSpan(10, 50, 0),
//                EndTime = new TimeSpan(12, 20, 0)
//            },

//            new ExamSlot
//            {
//                SlotName = "Ca 4",
//                StartTime = new TimeSpan(12, 50, 0),
//                EndTime = new TimeSpan(14, 20, 0)
//            },
//            // Ca 5: 14:40 - 16:10 (cách ca 4 là 10 phút, kết thúc 16:10)
//            new ExamSlot
//            {
//                SlotName = "Ca 5",
//                StartTime = new TimeSpan(14, 30, 0),
//                EndTime = new TimeSpan(16, 0, 0)
//            },
//          new ExamSlot
//            {
//                SlotName = "Ca 6",
//                StartTime = new TimeSpan(16, 10, 0),
//                EndTime = new TimeSpan(17, 40, 0)
//            }
//                };
//                await context.ExamSlots.AddRangeAsync(examSlots);
//                await context.SaveChangesAsync();
//            }
//        }


//        private static async Task SeedExamSlotRoomsAsync(GessDbContext context)
//        {
//            if (!context.ExamSlotRooms.Any())
//            {
//                // Kiểm tra dữ liệu cần thiết
//                if (!context.Rooms.Any())
//                {
//                    throw new Exception("No Rooms found. Please seed Rooms first.");
//                }
//                if (!context.ExamSlots.Any())
//                {
//                    throw new Exception("No ExamSlots found. Please seed ExamSlots first.");
//                }
//                if (!context.Semesters.Any())
//                {
//                    throw new Exception("No Semesters found. Please seed Semesters first.");
//                }
//                if (!context.Subjects.Any())
//                {
//                    throw new Exception("No Subjects found. Please seed Subjects first.");
//                }
//                if (!context.Teachers.Any())
//                {
//                    throw new Exception("No Teachers found. Please seed Teachers first.");
//                }
//                if (!context.MultiExams.Any() && !context.PracticeExams.Any())
//                {
//                    throw new Exception("No MultiExams or PracticeExams found. Please seed Exams first.");
//                }

//                // Lấy tất cả các bản ghi cần thiết
//                var rooms = context.Rooms.ToList();
//                var examSlots = context.ExamSlots.ToList();
//                var teachers = context.Teachers.ToList();
//                var multiExams = context.MultiExams.ToList();
//                var practiceExams = context.PracticeExams.ToList();

//                var examSlotRooms = new List<ExamSlotRoom>();
//                int roomIndex = 0;
//                int teacherIndex = 0;

//                // Tạo ExamSlotRoom cho từng MultiExam với logic phân bổ thông minh
//                foreach (var multiExam in multiExams)
//                {
//                    // FIXED: Tìm ca thi phù hợp dựa trên thời gian thi với TimeSpan
//                    var examTimeOfDay = multiExam.StartDay.TimeOfDay;

//                    // Tìm ca thi có thời gian exam nằm trong khoảng StartTime-EndTime
//                    var matchingSlot = examSlots.FirstOrDefault(slot =>
//                        examTimeOfDay >= slot.StartTime && examTimeOfDay <= slot.EndTime);

//                    // FIXED: Nếu không tìm thấy ca chính xác, tìm ca gần nhất dựa trên StartTime
//                    if (matchingSlot == null)
//                    {
//                        matchingSlot = examSlots
//                            .OrderBy(slot => Math.Abs((slot.StartTime - examTimeOfDay).TotalMinutes))
//                            .FirstOrDefault() ?? examSlots[0]; // Fallback to first slot
//                    }

//                    // Phân bổ phòng thi luân phiên
//                    var assignedRoom = rooms[roomIndex % rooms.Count];

//                    // Phân bổ giáo viên giám sát và chấm thi
//                    var supervisor = teachers[teacherIndex % teachers.Count];
//                    var grader = teachers[(teacherIndex + 1) % teachers.Count];

//                    examSlotRooms.Add(new ExamSlotRoom
//                    {
//                        RoomId = assignedRoom.RoomId,
//                        ExamSlotId = matchingSlot.ExamSlotId,
//                        SemesterId = multiExam.SemesterId,
//                        SubjectId = multiExam.SubjectId,
//                        SupervisorId = supervisor.TeacherId,
//                        ExamGradedId = grader.TeacherId,
//                        MultiOrPractice = "Multi",
//                        MultiExamId = multiExam.MultiExamId,
//                        PracticeExamId = null
//                    });

//                    roomIndex++;
//                    teacherIndex += 2;
//                }

//                // Tạo ExamSlotRoom cho từng PracticeExam với logic phân bổ thông minh
//                foreach (var practiceExam in practiceExams)
//                {
//                    // FIXED: Tìm ca thi phù hợp dựa trên thời gian thi với TimeSpan
//                    var examTimeOfDay = practiceExam.StartDay.TimeOfDay;

//                    // Tìm ca thi có thời gian exam nằm trong khoảng StartTime-EndTime
//                    var matchingSlot = examSlots.FirstOrDefault(slot =>
//                        examTimeOfDay >= slot.StartTime && examTimeOfDay <= slot.EndTime);

//                    // FIXED: Nếu không tìm thấy ca chính xác, tìm ca gần nhất dựa trên StartTime
//                    if (matchingSlot == null)
//                    {
//                        matchingSlot = examSlots
//                            .OrderBy(slot => Math.Abs((slot.StartTime - examTimeOfDay).TotalMinutes))
//                            .FirstOrDefault() ?? examSlots[0]; // Fallback to first slot
//                    }

//                    // Phân bổ phòng thi luân phiên
//                    var assignedRoom = rooms[roomIndex % rooms.Count];

//                    // Phân bổ giáo viên giám sát và chấm thi
//                    var supervisor = teachers[teacherIndex % teachers.Count];
//                    var grader = teachers[(teacherIndex + 1) % teachers.Count];

//                    examSlotRooms.Add(new ExamSlotRoom
//                    {
//                        RoomId = assignedRoom.RoomId,
//                        ExamSlotId = matchingSlot.ExamSlotId,
//                        SemesterId = practiceExam.SemesterId,
//                        SubjectId = practiceExam.SubjectId,
//                        SupervisorId = supervisor.TeacherId,
//                        ExamGradedId = grader.TeacherId,
//                        MultiOrPractice = "Practice",
//                        MultiExamId = null,
//                        PracticeExamId = practiceExam.PracExamId
//                    });

//                    roomIndex++;
//                    teacherIndex += 2;
//                }

//                // Thêm danh sách vào context và lưu
//                await context.ExamSlotRooms.AddRangeAsync(examSlotRooms);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedFinalExamsAsync(GessDbContext context)
//        {
//            if (!context.FinalExams.Any())
//            {
//                // Kiểm tra dữ liệu cần thiết
//                if (!context.MultiExams.Any())
//                {
//                    throw new Exception("No MultiExams found. Please seed MultiExams first.");
//                }
//                if (!context.MultiQuestions.Any())
//                {
//                    throw new Exception("No MultiQuestions found. Please seed MultiQuestions first.");
//                }

//                // Lấy ID thực tế từ database
//                var multiExam = context.MultiExams.First();
//                var multiQuestion = context.MultiQuestions.First();

//                var finalExam = new FinalExam
//                {
//                    MultiExamId = multiExam.MultiExamId,
//                    MultiQuestionId = multiQuestion.MultiQuestionId
//                };
//                await context.FinalExams.AddAsync(finalExam);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedNoQuestionInChaptersAsync(GessDbContext context)
//        {
//            if (!context.NoQuestionInChapters.Any())
//            {
//                // Kiểm tra dữ liệu cần thiết
//                if (!context.MultiExams.Any())
//                {
//                    throw new Exception("No MultiExams found. Please seed MultiExams first.");
//                }
//                if (!context.Chapters.Any())
//                {
//                    throw new Exception("No Chapters found. Please seed Chapters first.");
//                }
//                if (!context.LevelQuestions.Any())
//                {
//                    throw new Exception("No LevelQuestions found. Please seed LevelQuestions first.");
//                }

//                // Lấy ID thực tế từ database
//                var multiExam = context.MultiExams.First();
//                var chapter = context.Chapters.First();
//                var levelQuestion = context.LevelQuestions.First();

//                var noQuestion = new NoQuestionInChapter
//                {
//                    MultiExamId = multiExam.MultiExamId,
//                    ChapterId = chapter.ChapterId,
//                    LevelQuestionId = levelQuestion.LevelQuestionId,
//                    NumberQuestion = 5
//                };
//                await context.NoQuestionInChapters.AddAsync(noQuestion);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedTrainingProgramsAsync(GessDbContext context)
//        {
//            if (!context.TrainingPrograms.Any())
//            {
//                var majors = context.Majors.Take(5).ToList();

//                if (!majors.Any())
//                {
//                    throw new Exception("No majors found for TrainingProgram seeding");
//                }

//                var programs = new List<TrainingProgram>();

//                for (int i = 0; i < majors.Count; i++)
//                {
//                    programs.Add(new TrainingProgram
//                    {
//                        TrainProName = $"Chương trình {(char)('A' + i)}",
//                        StartDate = DateTime.Now,
//                        EndDate = DateTime.Now.AddYears(4),
//                        NoCredits = 120,
//                        MajorId = majors[i].MajorId
//                    });
//                }

//                await context.TrainingPrograms.AddRangeAsync(programs);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedApplyTrainingProgramsAsync(GessDbContext context)
//        {
//            if (!context.ApplyTrainingPrograms.Any())
//            {
//                var programs = context.TrainingPrograms.Take(5).ToList();
//                var cohorts = context.Cohorts.Take(5).ToList();

//                if (!programs.Any() || !cohorts.Any())
//                {
//                    throw new Exception("No training programs or cohorts found for ApplyTrainingProgram seeding");
//                }

//                var applys = new List<ApplyTrainingProgram>();
//                var maxCount = Math.Min(programs.Count, cohorts.Count);

//                for (int i = 0; i < maxCount; i++)
//                {
//                    applys.Add(new ApplyTrainingProgram
//                    {
//                        TrainProId = programs[i].TrainProId,
//                        CohortId = cohorts[i].CohortId
//                    });
//                }

//                await context.ApplyTrainingPrograms.AddRangeAsync(applys);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedRoomsAsync(GessDbContext context)
//        {
//            if (!context.Rooms.Any())
//            {
//                var rooms = new List<Room>
//                {
//                    new Room { RoomName = "A101", Capacity = 40, Status = "Available", Description = "Phòng học lý thuyết" },
//                    new Room { RoomName = "B202", Capacity = 30, Status = "Available", Description = "Phòng máy tính" },
//                    new Room { RoomName = "C303", Capacity = 50, Status = "Available", Description = "Phòng hội thảo" },
//                    new Room { RoomName = "D404", Capacity = 35, Status = "Available", Description = "Phòng lab" },
//                    new Room { RoomName = "E505", Capacity = 25, Status = "Available", Description = "Phòng seminar" }
//                };
//                await context.Rooms.AddRangeAsync(rooms);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedLevelQuestionsAsync(GessDbContext context)
//        {
//            if (!context.LevelQuestions.Any())
//            {
//                var levels = new List<LevelQuestion>
//                {
//                    new LevelQuestion { LevelQuestionName = "Dễ", Score = 0.5 },
//                    new LevelQuestion { LevelQuestionName = "Trung bình", Score = 1.0 },
//                    new LevelQuestion { LevelQuestionName = "Khó", Score = 1.3 },
//                    new LevelQuestion { LevelQuestionName = "Rất khó", Score = 1.5 },
//                    new LevelQuestion { LevelQuestionName = "Cơ bản", Score = 0.8 }
//                };
//                await context.LevelQuestions.AddRangeAsync(levels);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedSubjectTrainingProgramsAsync(GessDbContext context)
//        {
//            if (!context.SubjectTrainingPrograms.Any())
//            {
//                var subjects = context.Subjects.Take(5).ToList();
//                var programs = context.TrainingPrograms.Take(5).ToList();

//                if (!subjects.Any() || !programs.Any())
//                {
//                    throw new Exception("No subjects or training programs found for SubjectTrainingProgram seeding");
//                }

//                var stps = new List<SubjectTrainingProgram>();
//                var maxCount = Math.Min(subjects.Count, programs.Count);

//                for (int i = 0; i < maxCount; i++)
//                {
//                    stps.Add(new SubjectTrainingProgram
//                    {
//                        SubjectId = subjects[i].SubjectId,
//                        TrainProId = programs[i].TrainProId
//                    });
//                }

//                await context.SubjectTrainingPrograms.AddRangeAsync(stps);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedPreconditionSubjectsAsync(GessDbContext context)
//        {
//            if (!context.PreconditionSubjects.Any())
//            {
//                var stps = context.SubjectTrainingPrograms.Take(5).ToList();
//                var subjects = context.Subjects.Take(5).ToList();

//                if (!stps.Any() || !subjects.Any())
//                {
//                    throw new Exception("No subject training programs or subjects found for PreconditionSubject seeding");
//                }

//                var preconditions = new List<PreconditionSubject>();
//                var maxCount = Math.Min(stps.Count, subjects.Count);

//                for (int i = 0; i < maxCount; i++)
//                {
//                    preconditions.Add(new PreconditionSubject
//                    {
//                        SubTrainingProgramId = stps[i].SubTrainProgramId,
//                        PreconditionSubjectId = subjects[(i + 1) % subjects.Count].SubjectId
//                    });
//                }

//                await context.PreconditionSubjects.AddRangeAsync(preconditions);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedMultiExamsAsync(GessDbContext context)
//        {
//            if (!context.MultiExams.Any())
//            {
//                var teachers = context.Users.Where(u => u.Email.StartsWith("teacher")).ToList();
//                var subjects = context.Subjects.ToList();
//                var categories = context.CategoryExams.ToList();
//                var semester = context.Semesters.First();
//                var classes = context.Classes.ToList();

//                var multiExams = new List<MultiExam>();

//                // Tạo đề thi cho từng môn học
//                foreach (var subject in subjects)
//                {
//                    var relatedClasses = classes.Where(c => c.SubjectId == subject.SubjectId).ToList();
//                    if (!relatedClasses.Any()) continue;

//                    var teacher = teachers[subjects.IndexOf(subject) % teachers.Count];
//                    var relatedClass = relatedClasses.First();

//                    // Thi giữa kỳ
//                    var midtermCategory = categories.FirstOrDefault(c => c.CategoryExamName == "Thi giữa kỳ");
//                    if (midtermCategory != null)
//                    {
//                        multiExams.Add(new MultiExam
//                        {
//                            MultiExamName = $"Thi giữa kỳ {subject.SubjectName} - Đề 1",
//                            NumberQuestion = 15,
//                            Duration = 90,
//                            StartDay = new DateTime(2024, 6, 15, 8, 0, 0),
//                            EndDay = new DateTime(2024, 6, 15, 8, 0, 0),
//                            CreateAt = DateTime.Now,
//                            Status = "Published",
//                            CodeStart = $"MID1_{subject.Course}",
//                            TeacherId = teacher.Id,
//                            SubjectId = subject.SubjectId,
//                            CategoryExamId = midtermCategory.CategoryExamId,
//                            SemesterId = semester.SemesterId,
//                            ClassId = relatedClass.ClassId,
//                            IsPublish = true
//                        });

//                        multiExams.Add(new MultiExam
//                        {
//                            MultiExamName = $"Thi giữa kỳ {subject.SubjectName} - Đề 2",
//                            NumberQuestion = 15,
//                            Duration = 90,
//                            StartDay = new DateTime(2024, 6, 15, 10, 30, 0),
//                            EndDay = new DateTime(2024, 6, 15, 10, 30, 0),
//                            CreateAt = DateTime.Now,
//                            Status = "Published",
//                            CodeStart = $"MID2_{subject.Course}",
//                            TeacherId = teacher.Id,
//                            SubjectId = subject.SubjectId,
//                            CategoryExamId = midtermCategory.CategoryExamId,
//                            SemesterId = semester.SemesterId,
//                            ClassId = relatedClass.ClassId,
//                            IsPublish = true
//                        });
//                    }

//                    // Thi cuối kỳ
//                    var finalCategory = categories.FirstOrDefault(c => c.CategoryExamName == "Thi cuối kỳ");
//                    if (finalCategory != null)
//                    {
//                        multiExams.Add(new MultiExam
//                        {
//                            MultiExamName = $"Thi cuối kỳ {subject.SubjectName} - Đề 1",
//                            NumberQuestion = 25,
//                            Duration = 120,
//                            StartDay = new DateTime(2024, 6, 16, 8, 0, 0),
//                            EndDay = new DateTime(2024, 6, 16, 8, 0, 0),
//                            CreateAt = DateTime.Now,
//                            Status = "Published",
//                            CodeStart = $"FIN1_{subject.Course}",
//                            TeacherId = teacher.Id,
//                            SubjectId = subject.SubjectId,
//                            CategoryExamId = finalCategory.CategoryExamId,
//                            SemesterId = semester.SemesterId,
//                            ClassId = relatedClass.ClassId,
//                            IsPublish = true
//                        });
//                    }

//                    // Thi thử
//                    var practiceCategory = categories.FirstOrDefault(c => c.CategoryExamName == "Thi thử");
//                    if (practiceCategory != null)
//                    {
//                        multiExams.Add(new MultiExam
//                        {
//                            MultiExamName = $"Thi thử {subject.SubjectName}",
//                            NumberQuestion = 10,
//                            Duration = 60,
//                            StartDay = new DateTime(2024, 6, 14, 14, 0, 0),
//                            EndDay = new DateTime(2024, 6, 14, 14, 0, 0),
//                            CreateAt = DateTime.Now,
//                            Status = "Published",
//                            CodeStart = $"PRAC_{subject.Course}",
//                            TeacherId = teacher.Id,
//                            SubjectId = subject.SubjectId,
//                            CategoryExamId = practiceCategory.CategoryExamId,
//                            SemesterId = semester.SemesterId,
//                            ClassId = relatedClass.ClassId,
//                            IsPublish = true
//                        });
//                    }
//                }

//                await context.MultiExams.AddRangeAsync(multiExams);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedPracticeExamsAsync(GessDbContext context)
//        {
//            if (!context.PracticeExams.Any())
//            {
//                var teachers = context.Users.Where(u => u.Email.StartsWith("teacher")).ToList();
//                var subjects = context.Subjects.ToList();
//                var categories = context.CategoryExams.ToList();
//                var semester = context.Semesters.First();
//                var classes = context.Classes.ToList();

//                var practiceExams = new List<PracticeExam>();

//                // Tạo đề thi tự luận cho từng môn học
//                foreach (var subject in subjects)
//                {
//                    var relatedClasses = classes.Where(c => c.SubjectId == subject.SubjectId).ToList();
//                    if (!relatedClasses.Any()) continue;

//                    var teacher = teachers[subjects.IndexOf(subject) % teachers.Count];
//                    var relatedClass = relatedClasses.First();

//                    // Thi giữa kỳ tự luận
//                    var midtermCategory = categories.FirstOrDefault(c => c.CategoryExamName == "Thi giữa kỳ");
//                    if (midtermCategory != null)
//                    {
//                        practiceExams.Add(new PracticeExam
//                        {
//                            PracExamName = $"Thi giữa kỳ tự luận {subject.SubjectName} - Ca 1",
//                            Duration = 120,
//                            StartDay = new DateTime(2024, 6, 15, 13, 30, 0),
//                            EndDay = new DateTime(2024, 6, 15, 13, 30, 0),
//                            CreateAt = DateTime.Now,
//                            Status = "Published",
//                            CodeStart = $"PMID1_{subject.Course}",
//                            TeacherId = teacher.Id,
//                            CategoryExamId = midtermCategory.CategoryExamId,
//                            SubjectId = subject.SubjectId,
//                            SemesterId = semester.SemesterId,
//                            ClassId = relatedClass.ClassId
//                        });

//                        practiceExams.Add(new PracticeExam
//                        {
//                            PracExamName = $"Thi giữa kỳ tự luận {subject.SubjectName} - Ca 2",
//                            Duration = 120,
//                            StartDay = new DateTime(2024, 6, 15, 16, 0, 0),
//                            EndDay = new DateTime(2024, 6, 15, 16, 0, 0),
//                            CreateAt = DateTime.Now,
//                            Status = "Published",
//                            CodeStart = $"PMID2_{subject.Course}",
//                            TeacherId = teacher.Id,
//                            CategoryExamId = midtermCategory.CategoryExamId,
//                            SubjectId = subject.SubjectId,
//                            SemesterId = semester.SemesterId,
//                            ClassId = relatedClass.ClassId
//                        });
//                    }

//                    // Thi cuối kỳ tự luận
//                    var finalCategory = categories.FirstOrDefault(c => c.CategoryExamName == "Thi cuối kỳ");
//                    if (finalCategory != null)
//                    {
//                        practiceExams.Add(new PracticeExam
//                        {
//                            PracExamName = $"Thi cuối kỳ tự luận {subject.SubjectName} - Ca 1",
//                            Duration = 150,
//                            StartDay = new DateTime(2024, 6, 16, 13, 30, 0),
//                            EndDay = new DateTime(2024, 6, 16, 13, 30, 0),
//                            CreateAt = DateTime.Now,
//                            Status = "Published",
//                            CodeStart = $"PFIN1_{subject.Course}",
//                            TeacherId = teacher.Id,
//                            CategoryExamId = finalCategory.CategoryExamId,
//                            SubjectId = subject.SubjectId,
//                            SemesterId = semester.SemesterId,
//                            ClassId = relatedClass.ClassId
//                        });
//                    }

//                    // Thi thử tự luận
//                    var practiceCategory = categories.FirstOrDefault(c => c.CategoryExamName == "Thi thử");
//                    if (practiceCategory != null)
//                    {
//                        practiceExams.Add(new PracticeExam
//                        {
//                            PracExamName = $"Thi thử tự luận {subject.SubjectName}",
//                            Duration = 90,
//                            StartDay = new DateTime(2024, 6, 14, 18, 30, 0),
//                            EndDay = new DateTime(2024, 6, 14, 18, 30, 0),
//                            CreateAt = DateTime.Now,
//                            Status = "Published",
//                            CodeStart = $"PPRAC_{subject.Course}",
//                            TeacherId = teacher.Id,
//                            CategoryExamId = practiceCategory.CategoryExamId,
//                            SubjectId = subject.SubjectId,
//                            SemesterId = semester.SemesterId,
//                            ClassId = relatedClass.ClassId
//                        });
//                    }
//                }

//                await context.PracticeExams.AddRangeAsync(practiceExams);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedMultiQuestionsAsync(GessDbContext context)
//        {
//            if (!context.MultiQuestions.Any())
//            {
//                var teacherUser = context.Users.First(u => u.Email == "teacher1@example.com");

//                // Lấy ID thực tế từ database
//                var midtermCategory = context.CategoryExams.First(c => c.CategoryExamName == "Thi giữa kỳ");
//                var finalCategory = context.CategoryExams.First(c => c.CategoryExamName == "Thi cuối kỳ");
//                var easyLevel = context.LevelQuestions.First(l => l.LevelQuestionName == "Dễ");
//                var mediumLevel = context.LevelQuestions.First(l => l.LevelQuestionName == "Trung bình");
//                var hardLevel = context.LevelQuestions.First(l => l.LevelQuestionName == "Khó");
//                var semester = context.Semesters.First();
//                var chapter1 = context.Chapters.First(c => c.ChapterName == "Chương 1: Giới thiệu C#");
//                var chapter2 = context.Chapters.First(c => c.ChapterName == "Chương 2: Cú pháp cơ bản");
//                var chapter3 = context.Chapters.First(c => c.ChapterName == "Chương 3: Lập trình hướng đối tượng");

//                var multiQuestions = new List<MultiQuestion>
//                {
//                    new MultiQuestion
//                    {
//                        Content = "Câu hỏi 1: Trong C#, từ khóa nào được sử dụng để khai báo một lớp?",
//                        IsActive = true,
//                        CreatedBy = teacherUser.Id,
//                        IsPublic = true,
//                        ChapterId = chapter1.ChapterId,
//                        CategoryExamId = midtermCategory.CategoryExamId,
//                        LevelQuestionId = easyLevel.LevelQuestionId,
//                        SemesterId = semester.SemesterId
//                    },
//                    new MultiQuestion
//                    {
//                        Content = "Câu hỏi 2: Phương thức nào được gọi khi tạo một đối tượng mới trong C#?",
//                        IsActive = true,
//                        CreatedBy = teacherUser.Id,
//                        IsPublic = true,
//                        ChapterId = chapter1.ChapterId,
//                        CategoryExamId = midtermCategory.CategoryExamId,
//                        LevelQuestionId = mediumLevel.LevelQuestionId,
//                        SemesterId = semester.SemesterId
//                    },
//                    new MultiQuestion
//                    {
//                        Content = "Câu hỏi 3: Interface trong C# có thể chứa phương thức có thân không?",
//                        IsActive = true,
//                        CreatedBy = teacherUser.Id,
//                        IsPublic = true,
//                        ChapterId = chapter2.ChapterId,
//                        CategoryExamId = midtermCategory.CategoryExamId,
//                        LevelQuestionId = mediumLevel.LevelQuestionId,
//                        SemesterId = semester.SemesterId
//                    },
//                    new MultiQuestion
//                    {
//                        Content = "Câu hỏi 4: Từ khóa 'virtual' được sử dụng để làm gì trong C#?",
//                        IsActive = true,
//                        CreatedBy = teacherUser.Id,
//                        IsPublic = true,
//                        ChapterId = chapter2.ChapterId,
//                        CategoryExamId = finalCategory.CategoryExamId,
//                        LevelQuestionId = hardLevel.LevelQuestionId,
//                        SemesterId = semester.SemesterId
//                    },
//                    new MultiQuestion
//                    {
//                        Content = "Câu hỏi 5: Exception handling trong C# sử dụng từ khóa nào?",
//                        IsActive = true,
//                        CreatedBy = teacherUser.Id,
//                        IsPublic = true,
//                        ChapterId = chapter3.ChapterId,
//                        CategoryExamId = finalCategory.CategoryExamId,
//                        LevelQuestionId = easyLevel.LevelQuestionId,
//                        SemesterId = semester.SemesterId
//                    }
//                };
//                await context.MultiQuestions.AddRangeAsync(multiQuestions);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedMultiAnswersAsync(GessDbContext context)
//        {
//            if (!context.MultiAnswers.Any())
//            {
//                // Lấy ID thực tế từ database
//                var questions = context.MultiQuestions.ToList();

//                if (!questions.Any())
//                {
//                    throw new Exception("No MultiQuestions found for MultiAnswers seeding");
//                }

//                var multiAnswers = new List<MultiAnswer>
//                {
//                    // Câu hỏi 1
//                    new MultiAnswer { MultiQuestionId = questions[0].MultiQuestionId, AnswerContent = "class", IsCorrect = true },
//                    new MultiAnswer { MultiQuestionId = questions[0].MultiQuestionId, AnswerContent = "struct", IsCorrect = false },
//                    new MultiAnswer { MultiQuestionId = questions[0].MultiQuestionId, AnswerContent = "interface", IsCorrect = false },
//                    new MultiAnswer { MultiQuestionId = questions[0].MultiQuestionId, AnswerContent = "enum", IsCorrect = false },
                    
//                    // Câu hỏi 2
//                    new MultiAnswer { MultiQuestionId = questions[1].MultiQuestionId, AnswerContent = "Constructor", IsCorrect = true },
//                    new MultiAnswer { MultiQuestionId = questions[1].MultiQuestionId, AnswerContent = "Destructor", IsCorrect = false },
//                    new MultiAnswer { MultiQuestionId = questions[1].MultiQuestionId, AnswerContent = "Method", IsCorrect = false },
//                    new MultiAnswer { MultiQuestionId = questions[1].MultiQuestionId, AnswerContent = "Property", IsCorrect = false },
                    
//                    // Câu hỏi 3
//                    new MultiAnswer { MultiQuestionId = questions[2].MultiQuestionId, AnswerContent = "Không, chỉ chứa khai báo", IsCorrect = true },
//                    new MultiAnswer { MultiQuestionId = questions[2].MultiQuestionId, AnswerContent = "Có, có thể chứa thân", IsCorrect = false },
//                    new MultiAnswer { MultiQuestionId = questions[2].MultiQuestionId, AnswerContent = "Tùy thuộc vào phiên bản C#", IsCorrect = false },
//                    new MultiAnswer { MultiQuestionId = questions[2].MultiQuestionId, AnswerContent = "Chỉ trong C# 8.0 trở lên", IsCorrect = false },
                    
//                    // Câu hỏi 4
//                    new MultiAnswer { MultiQuestionId = questions[3].MultiQuestionId, AnswerContent = "Cho phép override", IsCorrect = true },
//                    new MultiAnswer { MultiQuestionId = questions[3].MultiQuestionId, AnswerContent = "Ngăn chặn override", IsCorrect = false },
//                    new MultiAnswer { MultiQuestionId = questions[3].MultiQuestionId, AnswerContent = "Tạo phương thức tĩnh", IsCorrect = false },
//                    new MultiAnswer { MultiQuestionId = questions[3].MultiQuestionId, AnswerContent = "Tạo phương thức private", IsCorrect = false },
                    
//                    // Câu hỏi 5
//                    new MultiAnswer { MultiQuestionId = questions[4].MultiQuestionId, AnswerContent = "try-catch", IsCorrect = true },
//                    new MultiAnswer { MultiQuestionId = questions[4].MultiQuestionId, AnswerContent = "if-else", IsCorrect = false },
//                    new MultiAnswer { MultiQuestionId = questions[4].MultiQuestionId, AnswerContent = "switch-case", IsCorrect = false },
//                    new MultiAnswer { MultiQuestionId = questions[4].MultiQuestionId, AnswerContent = "for-while", IsCorrect = false }
//                };
//                await context.MultiAnswers.AddRangeAsync(multiAnswers);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedMultiExamHistoriesAsync(GessDbContext context)
//        {
//            if (!context.MultiExamHistories.Any())
//            {
//                var students = context.Students.Take(3).ToList();
//                var multiExams = context.MultiExams.Take(3).ToList();

//                if (students.Any() && multiExams.Any())
//                {
//                    var multiExamHistories = new List<MultiExamHistory>();

//                    // Create history for first student and exam
//                    if (students.Count > 0 && multiExams.Count > 0)
//                    {
//                        multiExamHistories.Add(new MultiExamHistory
//                        {
//                            ExamHistoryId = Guid.NewGuid(),
//                            MultiExamId = multiExams[0].MultiExamId,
//                            StudentId = students[0].StudentId,
//                            StartTime = DateTime.Now.AddHours(-2),
//                            EndTime = DateTime.Now.AddHours(-1),
//                            Score = 8.0,
//                            CheckIn = true,
//                            StatusExam = "Completed",
//                            IsGrade = true
//                        });
//                    }

//                    // Create history for second student and exam
//                    if (students.Count > 1 && multiExams.Count > 1)
//                    {
//                        multiExamHistories.Add(new MultiExamHistory
//                        {
//                            ExamHistoryId = Guid.NewGuid(),
//                            MultiExamId = multiExams[1].MultiExamId,
//                            StudentId = students[1].StudentId,
//                            StartTime = DateTime.Now.AddHours(-1),
//                            EndTime = DateTime.Now.AddMinutes(-30),
//                            Score = 9.0,
//                            CheckIn = true,
//                            StatusExam = "Completed",
//                            IsGrade = true
//                        });
//                    }

//                    // Create history for third student and exam
//                    if (students.Count > 2 && multiExams.Count > 2)
//                    {
//                        multiExamHistories.Add(new MultiExamHistory
//                        {
//                            ExamHistoryId = Guid.NewGuid(),
//                            MultiExamId = multiExams[2].MultiExamId,
//                            StudentId = students[2].StudentId,
//                            StartTime = DateTime.Now,
//                            Score = null,
//                            CheckIn = true,
//                            StatusExam = "InProgress",
//                            IsGrade = false
//                        });
//                    }

//                    if (multiExamHistories.Any())
//                    {
//                        await context.MultiExamHistories.AddRangeAsync(multiExamHistories);
//                        await context.SaveChangesAsync();
//                    }
//                }
//            }
//        }

//        private static async Task SeedQuestionMultiExamsAsync(GessDbContext context)
//        {
//            if (!context.QuestionMultiExams.Any())
//            {
//                var multiExamHistories = context.MultiExamHistories.Take(2).ToList();
//                var multiQuestions = context.MultiQuestions.Take(3).ToList();

//                if (multiExamHistories.Any() && multiQuestions.Any())
//                {
//                    var questionMultiExams = new List<QuestionMultiExam>();

//                    // Create question for first history and first question
//                    if (multiExamHistories.Count > 0 && multiQuestions.Count > 0)
//                    {
//                        questionMultiExams.Add(new QuestionMultiExam
//                        {
//                            MultiExamHistoryId = multiExamHistories[0].ExamHistoryId,
//                            MultiQuestionId = multiQuestions[0].MultiQuestionId,
//                            QuestionOrder = 1,
//                            Answer = "class",
//                            Score = 1.0
//                        });
//                    }

//                    // Create question for first history and second question
//                    if (multiExamHistories.Count > 0 && multiQuestions.Count > 1)
//                    {
//                        questionMultiExams.Add(new QuestionMultiExam
//                        {
//                            MultiExamHistoryId = multiExamHistories[0].ExamHistoryId,
//                            MultiQuestionId = multiQuestions[1].MultiQuestionId,
//                            QuestionOrder = 2,
//                            Answer = "Constructor",
//                            Score = 2.0
//                        });
//                    }

//                    // Create question for second history and third question
//                    if (multiExamHistories.Count > 1 && multiQuestions.Count > 2)
//                    {
//                        questionMultiExams.Add(new QuestionMultiExam
//                        {
//                            MultiExamHistoryId = multiExamHistories[1].ExamHistoryId,
//                            MultiQuestionId = multiQuestions[2].MultiQuestionId,
//                            QuestionOrder = 1,
//                            Answer = "Không, chỉ chứa khai báo",
//                            Score = 2.0
//                        });
//                    }

//                    if (questionMultiExams.Any())
//                    {
//                        await context.QuestionMultiExams.AddRangeAsync(questionMultiExams);
//                        await context.SaveChangesAsync();
//                    }
//                }
//            }
//        }

//        private static async Task SeedPracticeExamHistoriesAsync(GessDbContext context)
//        {
//            if (!context.PracticeExamHistories.Any())
//            {
//                var students = context.Students.Take(3).ToList();
//                var practiceExams = context.PracticeExams.Take(3).ToList();

//                if (students.Any() && practiceExams.Any())
//                {
//                    var practiceExamHistories = new List<PracticeExamHistory>();

//                    // Create history for first student and exam
//                    if (students.Count > 0 && practiceExams.Count > 0)
//                    {
//                        practiceExamHistories.Add(new PracticeExamHistory
//                        {
//                            PracExamHistoryId = Guid.NewGuid(),
//                            PracExamId = practiceExams[0].PracExamId,
//                            StudentId = students[0].StudentId,
//                            StartTime = DateTime.Now.AddHours(-3),
//                            EndTime = DateTime.Now.AddHours(-2),
//                            Score = 8.5,
//                            CheckIn = true,
//                            StatusExam = "Completed",
//                            IsGraded = true
//                        });
//                    }

//                    // Create history for second student and exam
//                    if (students.Count > 1 && practiceExams.Count > 1)
//                    {
//                        practiceExamHistories.Add(new PracticeExamHistory
//                        {
//                            PracExamHistoryId = Guid.NewGuid(),
//                            PracExamId = practiceExams[1].PracExamId,
//                            StudentId = students[1].StudentId,
//                            StartTime = DateTime.Now.AddHours(-1),
//                            EndTime = DateTime.Now.AddMinutes(-30),
//                            Score = 9.0,
//                            CheckIn = true,
//                            StatusExam = "Completed",
//                            IsGraded = true
//                        });
//                    }

//                    // Create history for third student and exam
//                    if (students.Count > 2 && practiceExams.Count > 2)
//                    {
//                        practiceExamHistories.Add(new PracticeExamHistory
//                        {
//                            PracExamHistoryId = Guid.NewGuid(),
//                            PracExamId = practiceExams[2].PracExamId,
//                            StudentId = students[2].StudentId,
//                            StartTime = DateTime.Now,
//                            Score = null,
//                            CheckIn = true,
//                            StatusExam = "InProgress",
//                            IsGraded = false
//                        });
//                    }

//                    if (practiceExamHistories.Any())
//                    {
//                        await context.PracticeExamHistories.AddRangeAsync(practiceExamHistories);
//                        await context.SaveChangesAsync();
//                    }
//                }
//            }
//        }

//        private static async Task SeedQuestionPracExamsAsync(GessDbContext context)
//        {
//            if (!context.QuestionPracExams.Any())
//            {
//                var practiceExamHistories = context.PracticeExamHistories.Take(2).ToList();
//                var practiceQuestions = context.PracticeQuestions.Take(2).ToList();

//                if (practiceExamHistories.Any() && practiceQuestions.Any())
//                {
//                    var questionPracExams = new List<QuestionPracExam>();

//                    // Create question for first history and first question
//                    if (practiceExamHistories.Count > 0 && practiceQuestions.Count > 0)
//                    {
//                        questionPracExams.Add(new QuestionPracExam
//                        {
//                            PracExamHistoryId = practiceExamHistories[0].PracExamHistoryId,
//                            PracticeQuestionId = practiceQuestions[0].PracticeQuestionId,
//                            Answer = "OOP là phương pháp lập trình dựa trên đối tượng...",
//                            Score = 4.0
//                        });
//                    }

//                    // Create question for second history and second question
//                    if (practiceExamHistories.Count > 1 && practiceQuestions.Count > 1)
//                    {
//                        questionPracExams.Add(new QuestionPracExam
//                        {
//                            PracExamHistoryId = practiceExamHistories[1].PracExamHistoryId,
//                            PracticeQuestionId = practiceQuestions[1].PracticeQuestionId,
//                            Answer = "Interface chỉ chứa khai báo, abstract class có thể chứa cả phương thức có thân...",
//                            Score = 4.5
//                        });
//                    }

//                    if (questionPracExams.Any())
//                    {
//                        await context.QuestionPracExams.AddRangeAsync(questionPracExams);
//                        await context.SaveChangesAsync();
//                    }
//                }
//            }
//        }

//        private static async Task SeedStudentExamSlotRoomsAsync(GessDbContext context)
//        {
//            if (!context.StudentExamSlotRoom.Any())
//            {
//                // Kiểm tra dữ liệu cần thiết
//                if (!context.Students.Any())
//                {
//                    throw new Exception("No Students found. Please seed Students first.");
//                }
//                if (!context.ExamSlotRooms.Any())
//                {
//                    throw new Exception("No ExamSlotRooms found. Please seed ExamSlotRooms first.");
//                }

//                var students = context.Students.ToList();
//                var examSlotRooms = context.ExamSlotRooms.ToList();

//                if (!students.Any() || !examSlotRooms.Any())
//                {
//                    throw new Exception("Insufficient data for StudentExamSlotRoom seeding");
//                }

//                var studentExamSlotRooms = new List<StudentExamSlotRoom>();

//                // Phân bổ sinh viên vào các phòng thi
//                foreach (var examSlotRoom in examSlotRooms)
//                {
//                    // Lấy 3-4 sinh viên ngẫu nhiên cho mỗi phòng thi
//                    var randomStudents = students.OrderBy(x => Guid.NewGuid()).Take(3).ToList();

//                    foreach (var student in randomStudents)
//                    {
//                        studentExamSlotRooms.Add(new StudentExamSlotRoom
//                        {
//                            StudentId = student.StudentId,
//                            ExamSlotRoomId = examSlotRoom.ExamSlotRoomId
//                        });
//                    }
//                }

//                await context.StudentExamSlotRoom.AddRangeAsync(studentExamSlotRooms);
//                await context.SaveChangesAsync();
//            }
//        }

//        private static async Task SeedAdditionalMultiExamHistoriesAsync(GessDbContext context)
//        {
//            // Kiểm tra xem đã có dữ liệu MultiExamHistories chưa
//            var existingCount = context.MultiExamHistories.Count();

//            if (existingCount < 10) // Nếu ít hơn 10 bản ghi thì thêm
//            {
//                var students = context.Students.ToList();
//                var multiExams = context.MultiExams.ToList();
//                var examSlotRooms = context.ExamSlotRooms.Where(esr => esr.MultiOrPractice == "Multi").ToList();

//                if (!students.Any() || !multiExams.Any() || !examSlotRooms.Any())
//                {
//                    return; // Không có dữ liệu để seed
//                }

//                var additionalHistories = new List<MultiExamHistory>();

//                // Tạo thêm lịch sử thi cho các sinh viên
//                for (int i = 0; i < Math.Min(students.Count, multiExams.Count); i++)
//                {
//                    var student = students[i];
//                    var multiExam = multiExams[i % multiExams.Count];
//                    var examSlotRoom = examSlotRooms[i % examSlotRooms.Count];

//                    // Kiểm tra xem sinh viên đã có lịch sử thi cho exam này chưa
//                    var existingHistory = context.MultiExamHistories
//                        .Any(meh => meh.StudentId == student.StudentId && meh.MultiExamId == multiExam.MultiExamId);

//                    if (!existingHistory)
//                    {
//                        additionalHistories.Add(new MultiExamHistory
//                        {
//                            ExamHistoryId = Guid.NewGuid(),
//                            StartTime = DateTime.Now.AddHours(-i - 1),
//                            EndTime = DateTime.Now.AddHours(-i),
//                            Score = 5.0 + (i * 0.5) % 5, // Điểm từ 5.0 đến 10.0
//                            CheckIn = true,
//                            StatusExam = i % 3 == 0 ? "InProgress" : "Completed",
//                            IsGrade = i % 3 != 0,
//                            ExamSlotRoomId = examSlotRoom.ExamSlotRoomId,
//                            MultiExamId = multiExam.MultiExamId,
//                            StudentId = student.StudentId
//                        });
//                    }
//                }

//                if (additionalHistories.Any())
//                {
//                    await context.MultiExamHistories.AddRangeAsync(additionalHistories);
//                    await context.SaveChangesAsync();
//                }
//            }
//        }

//        private static async Task SeedAdditionalPracticeExamHistoriesAsync(GessDbContext context)
//        {
//            // Tương tự như MultiExamHistories nhưng cho PracticeExam
//            var existingCount = context.PracticeExamHistories.Count();

//            if (existingCount < 8)
//            {
//                var students = context.Students.ToList();
//                var practiceExams = context.PracticeExams.ToList();
//                var examSlotRooms = context.ExamSlotRooms.Where(esr => esr.MultiOrPractice == "Practice").ToList();

//                if (!students.Any() || !practiceExams.Any() || !examSlotRooms.Any())
//                {
//                    return;
//                }

//                var additionalHistories = new List<PracticeExamHistory>();

//                for (int i = 0; i < Math.Min(students.Count, practiceExams.Count * 2); i++)
//                {
//                    var student = students[i % students.Count];
//                    var practiceExam = practiceExams[i % practiceExams.Count];
//                    var examSlotRoom = examSlotRooms[i % examSlotRooms.Count];

//                    var existingHistory = context.PracticeExamHistories
//                        .Any(peh => peh.StudentId == student.StudentId && peh.PracExamId == practiceExam.PracExamId);

//                    if (!existingHistory)
//                    {
//                        additionalHistories.Add(new PracticeExamHistory
//                        {
//                            PracExamHistoryId = Guid.NewGuid(),
//                            StartTime = DateTime.Now.AddHours(-i - 2),
//                            EndTime = DateTime.Now.AddHours(-i - 1),
//                            Score = 6.0 + (i * 0.3) % 4, // Điểm từ 6.0 đến 10.0
//                            CheckIn = true,
//                            StatusExam = i % 4 == 0 ? "InProgress" : "Completed",
//                            IsGraded = i % 4 != 0,
//                            ExamSlotRoomId = examSlotRoom.ExamSlotRoomId,
//                            PracExamId = practiceExam.PracExamId,
//                            StudentId = student.StudentId
//                        });
//                    }
//                }

//                if (additionalHistories.Any())
//                {
//                    await context.PracticeExamHistories.AddRangeAsync(additionalHistories);
//                    await context.SaveChangesAsync();
//                }
//            }
//        }

//        private static async Task SeedExamServicesAsync(GessDbContext context)
//        {
//            if (!context.ExamServices.Any())
//            {
//                // Lấy người dùng có role Examination
//                var examinationUsers = context.Users.Where(u =>
//                    context.UserRoles.Any(ur => ur.UserId == u.Id &&
//                        context.Roles.Any(r => r.Id == ur.RoleId && r.Name == PredefinedRole.EXAMINATION_ROLE)))
//                    .ToList();

//                if (examinationUsers.Any())
//                {
//                    var examServices = new List<ExamService>();

//                    foreach (var user in examinationUsers)
//                    {
//                        examServices.Add(new ExamService
//                        {
//                            ExamServiceId = user.Id,
//                            UserId = user.Id
//                        });
//                    }

//                    await context.ExamServices.AddRangeAsync(examServices);
//                    await context.SaveChangesAsync();
//                }
//            }
//        }

//        private static async Task SeedRefreshTokensAsync(GessDbContext context)
//        {
//            if (!context.RefreshTokens.Any())
//            {
//                var users = context.Users.Take(5).ToList();
//                var refreshTokens = new List<RefreshToken>();

//                foreach (var user in users)
//                {
//                    refreshTokens.Add(new RefreshToken
//                    {
//                        Token = Guid.NewGuid().ToString(),
//                        ExpiresAt = DateTime.UtcNow.AddDays(7),
//                        IssuedAt = DateTime.UtcNow,
//                        IsRevoked = false,
//                        UserId = user.Id
//                    });
//                }

//                await context.RefreshTokens.AddRangeAsync(refreshTokens);
//                await context.SaveChangesAsync();
//            }
//        }

//        /// <summary>
//        /// Xóa toàn bộ dữ liệu trong database theo thứ tự đúng để tránh lỗi foreign key constraint
//        /// </summary>
//        public static async Task ClearAllDataAsync(GessDbContext context)
//        {
//            try
//            {
//                // Xóa dữ liệu theo thứ tự ngược lại với thứ tự tạo
//                // Các bảng có foreign key phải xóa trước

//                // 1. Xóa các bảng liên kết cuối cùng
//                if (context.QuestionMultiExams.Any())
//                {
//                    context.QuestionMultiExams.RemoveRange(context.QuestionMultiExams);
//                    await context.SaveChangesAsync();
//                }

//                if (context.QuestionPracExams.Any())
//                {
//                    context.QuestionPracExams.RemoveRange(context.QuestionPracExams);
//                    await context.SaveChangesAsync();
//                }

//                if (context.StudentExamSlotRoom.Any())
//                {
//                    context.StudentExamSlotRoom.RemoveRange(context.StudentExamSlotRoom);
//                    await context.SaveChangesAsync();
//                }

//                // 2. Xóa lịch sử thi
//                if (context.MultiExamHistories.Any())
//                {
//                    context.MultiExamHistories.RemoveRange(context.MultiExamHistories);
//                    await context.SaveChangesAsync();
//                }

//                if (context.PracticeExamHistories.Any())
//                {
//                    context.PracticeExamHistories.RemoveRange(context.PracticeExamHistories);
//                    await context.SaveChangesAsync();
//                }

//                // 3. Xóa các bảng thi
//                if (context.FinalExams.Any())
//                {
//                    context.FinalExams.RemoveRange(context.FinalExams);
//                    await context.SaveChangesAsync();
//                }

//                if (context.NoQuestionInChapters.Any())
//                {
//                    context.NoQuestionInChapters.RemoveRange(context.NoQuestionInChapters);
//                    await context.SaveChangesAsync();
//                }

//                if (context.NoPEPaperInPEs.Any())
//                {
//                    context.NoPEPaperInPEs.RemoveRange(context.NoPEPaperInPEs);
//                    await context.SaveChangesAsync();
//                }

//                if (context.PracticeTestQuestions.Any())
//                {
//                    context.PracticeTestQuestions.RemoveRange(context.PracticeTestQuestions);
//                    await context.SaveChangesAsync();
//                }

//                // 4. Xóa câu trả lời và câu hỏi
//                if (context.MultiAnswers.Any())
//                {
//                    context.MultiAnswers.RemoveRange(context.MultiAnswers);
//                    await context.SaveChangesAsync();
//                }

//                if (context.PracticeAnswers.Any())
//                {
//                    context.PracticeAnswers.RemoveRange(context.PracticeAnswers);
//                    await context.SaveChangesAsync();
//                }

//                if (context.MultiQuestions.Any())
//                {
//                    context.MultiQuestions.RemoveRange(context.MultiQuestions);
//                    await context.SaveChangesAsync();
//                }

//                if (context.PracticeQuestions.Any())
//                {
//                    context.PracticeQuestions.RemoveRange(context.PracticeQuestions);
//                    await context.SaveChangesAsync();
//                }

//                // 5. Xóa các bảng phòng thi và lịch thi
//                if (context.ExamSlotRooms.Any())
//                {
//                    context.ExamSlotRooms.RemoveRange(context.ExamSlotRooms);
//                    await context.SaveChangesAsync();
//                }

//                if (context.MultiExams.Any())
//                {
//                    context.MultiExams.RemoveRange(context.MultiExams);
//                    await context.SaveChangesAsync();
//                }

//                if (context.PracticeExams.Any())
//                {
//                    context.PracticeExams.RemoveRange(context.PracticeExams);
//                    await context.SaveChangesAsync();
//                }

//                if (context.PracticeExamPapers.Any())
//                {
//                    context.PracticeExamPapers.RemoveRange(context.PracticeExamPapers);
//                    await context.SaveChangesAsync();
//                }

//                if (context.ExamSlots.Any())
//                {
//                    context.ExamSlots.RemoveRange(context.ExamSlots);
//                    await context.SaveChangesAsync();
//                }

//                if (context.Rooms.Any())
//                {
//                    context.Rooms.RemoveRange(context.Rooms);
//                    await context.SaveChangesAsync();
//                }

//                // 6. Xóa các bảng học tập
//                if (context.ClassStudents.Any())
//                {
//                    context.ClassStudents.RemoveRange(context.ClassStudents);
//                    await context.SaveChangesAsync();
//                }

//                if (context.Classes.Any())
//                {
//                    context.Classes.RemoveRange(context.Classes);
//                    await context.SaveChangesAsync();
//                }

//                if (context.Students.Any())
//                {
//                    context.Students.RemoveRange(context.Students);
//                    await context.SaveChangesAsync();
//                }

//                if (context.Teachers.Any())
//                {
//                    context.Teachers.RemoveRange(context.Teachers);
//                    await context.SaveChangesAsync();
//                }

//                if (context.Chapters.Any())
//                {
//                    context.Chapters.RemoveRange(context.Chapters);
//                    await context.SaveChangesAsync();
//                }

//                // 7. Xóa các bảng liên kết và cấu hình
//                if (context.CategoryExamSubjects.Any())
//                {
//                    context.CategoryExamSubjects.RemoveRange(context.CategoryExamSubjects);
//                    await context.SaveChangesAsync();
//                }

//                if (context.PreconditionSubjects.Any())
//                {
//                    context.PreconditionSubjects.RemoveRange(context.PreconditionSubjects);
//                    await context.SaveChangesAsync();
//                }

//                if (context.SubjectTrainingPrograms.Any())
//                {
//                    context.SubjectTrainingPrograms.RemoveRange(context.SubjectTrainingPrograms);
//                    await context.SaveChangesAsync();
//                }

//                if (context.ApplyTrainingPrograms.Any())
//                {
//                    context.ApplyTrainingPrograms.RemoveRange(context.ApplyTrainingPrograms);
//                    await context.SaveChangesAsync();
//                }

//                if (context.TrainingPrograms.Any())
//                {
//                    context.TrainingPrograms.RemoveRange(context.TrainingPrograms);
//                    await context.SaveChangesAsync();
//                }

//                if (context.Subjects.Any())
//                {
//                    context.Subjects.RemoveRange(context.Subjects);
//                    await context.SaveChangesAsync();
//                }

//                if (context.CategoryExams.Any())
//                {
//                    context.CategoryExams.RemoveRange(context.CategoryExams);
//                    await context.SaveChangesAsync();
//                }

//                if (context.LevelQuestions.Any())
//                {
//                    context.LevelQuestions.RemoveRange(context.LevelQuestions);
//                    await context.SaveChangesAsync();
//                }

//                if (context.Cohorts.Any())
//                {
//                    context.Cohorts.RemoveRange(context.Cohorts);
//                    await context.SaveChangesAsync();
//                }

//                if (context.Semesters.Any())
//                {
//                    context.Semesters.RemoveRange(context.Semesters);
//                    await context.SaveChangesAsync();
//                }

//                if (context.Majors.Any())
//                {
//                    context.Majors.RemoveRange(context.Majors);
//                    await context.SaveChangesAsync();
//                }

//                // 8. Xóa các bảng hệ thống cuối cùng
//                if (context.ExamServices.Any())
//                {
//                    context.ExamServices.RemoveRange(context.ExamServices);
//                    await context.SaveChangesAsync();
//                }

//                if (context.RefreshTokens.Any())
//                {
//                    context.RefreshTokens.RemoveRange(context.RefreshTokens);
//                    await context.SaveChangesAsync();
//                }

//                // 9. Xóa AspNet Identity tables cuối cùng
//                var userRoles = context.UserRoles.ToList();
//                if (userRoles.Any())
//                {
//                    context.UserRoles.RemoveRange(userRoles);
//                    await context.SaveChangesAsync();
//                }

//                var users = context.Users.ToList();
//                if (users.Any())
//                {
//                    context.Users.RemoveRange(users);
//                    await context.SaveChangesAsync();
//                }

//                var roles = context.Roles.ToList();
//                if (roles.Any())
//                {
//                    context.Roles.RemoveRange(roles);
//                    await context.SaveChangesAsync();
//                }

//                Console.WriteLine("Đã xóa thành công toàn bộ dữ liệu trong database.");
//            }
//            catch (Exception ex)
//            {
//                throw new Exception($"Lỗi khi xóa dữ liệu: {ex.Message}", ex);
//            }
//        }

//        /// <summary>
//        /// Xóa toàn bộ dữ liệu trong database theo thứ tự đúng để tránh lỗi foreign key constraint
//        /// </summary>

//    }
//}
