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

            // 1. Tạo dữ liệu cho bảng độc lập
            await SeedRolesAsync(roleManager);
            await SeedUsersAsync(userManager);
            await SeedMajorsAsync(context);
            await SeedSemestersAsync(context);

            // 2. Tạo dữ liệu phụ thuộc
            await SeedTeachersAsync(context);
            await SeedSubjectsAsync(context);
            await SeedChaptersAsync(context);
            await SeedClassesAsync(context);
        }

        private static async Task SeedRolesAsync(RoleManager<IdentityRole<Guid>> roleManager)
        {
            string[] roles = new[] { "Admin", "Trưởng bộ môn", "Giáo viên", "Khảo thí", "Sinh viên" };
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
            // Admin users
            await CreateUser(userManager, "admin@example.com", "Nguyễn Văn A", "Password123!", new DateTime(1980, 1, 1), "1234567890", true, "Admin");
            await CreateUser(userManager, "admin2@example.com", "Trần Thị B", "Password123!", new DateTime(1982, 3, 15), "1234567891", true, "Admin");

            // Trưởng bộ môn
            await CreateUser(userManager, "hod1@example.com", "Lê Văn C", "Password123!", new DateTime(1983, 5, 10), "0987654321", true, "Trưởng bộ môn");
            await CreateUser(userManager, "hod2@example.com", "Phạm Thị D", "Password123!", new DateTime(1984, 7, 20), "0987654322", false, "Trưởng bộ môn");

            // Giáo viên
            await CreateUser(userManager, "teacher1@example.com", "Hoàng Văn E", "Password123!", new DateTime(1985, 5, 10), "0987654323", true, "Giáo viên");
            await CreateUser(userManager, "teacher2@example.com", "Vũ Thị F", "Password123!", new DateTime(1987, 7, 20), "0987654324", false, "Giáo viên");
            await CreateUser(userManager, "teacher3@example.com", "Đỗ Văn G", "Password123!", new DateTime(1990, 9, 30), "0987654325", true, "Giáo viên");
            await CreateUser(userManager, "teacher4@example.com", "Ngô Văn H", "Password123!", new DateTime(1988, 4, 15), "0987654326", true, "Giáo viên");
            await CreateUser(userManager, "teacher5@example.com", "Đặng Thị I", "Password123!", new DateTime(1989, 6, 25), "0987654327", false, "Giáo viên");

            // Khảo thí
            await CreateUser(userManager, "exam1@example.com", "Ngô Thị H", "Password123!", new DateTime(1986, 6, 15), "0987654328", false, "Khảo thí");
            await CreateUser(userManager, "exam2@example.com", "Đặng Văn I", "Password123!", new DateTime(1988, 8, 25), "0987654329", true, "Khảo thí");
            await CreateUser(userManager, "tuanvahe140809@fpt.edu.vn", "Đặng Văn I", "Password123!", new DateTime(1988, 8, 25), "0987654329", true, "Khảo thí");

            // Sinh viên
            await CreateUser(userManager, "student1@example.com", "Phạm Minh J", "Password123!", new DateTime(2000, 8, 15), "0123456789", true, "Sinh viên");
            await CreateUser(userManager, "student2@example.com", "Hoàng Anh K", "Password123!", new DateTime(2001, 9, 20), "0123456790", false, "Sinh viên");
            await CreateUser(userManager, "student3@example.com", "Vũ Thị L", "Password123!", new DateTime(2002, 10, 25), "0123456791", true, "Sinh viên");
            await CreateUser(userManager, "student4@example.com", "Trần Văn M", "Password123!", new DateTime(2000, 7, 10), "0123456792", true, "Sinh viên");
            await CreateUser(userManager, "student5@example.com", "Lê Thị N", "Password123!", new DateTime(2001, 11, 5), "0123456793", false, "Sinh viên");
            await CreateUser(userManager, "student6@example.com", "Nguyễn Văn O", "Password123!", new DateTime(2002, 3, 15), "0123456794", true, "Sinh viên");
            await CreateUser(userManager, "student7@example.com", "Phạm Thị P", "Password123!", new DateTime(2000, 5, 20), "0123456795", false, "Sinh viên");
            await CreateUser(userManager, "student8@example.com", "Hoàng Văn Q", "Password123!", new DateTime(2001, 12, 30), "0123456796", true, "Sinh viên");
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
                        HireDate = new DateTime(2020, 9, 1)
                    },
                    new Teacher 
                    { 
                        TeacherId = context.Users.First(u => u.Email == "teacher2@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "teacher2@example.com").Id,
                        HireDate = new DateTime(2021, 9, 1)
                    },
                    new Teacher 
                    { 
                        TeacherId = context.Users.First(u => u.Email == "teacher3@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "teacher3@example.com").Id,
                        HireDate = new DateTime(2022, 9, 1)
                    },
                    new Teacher 
                    { 
                        TeacherId = context.Users.First(u => u.Email == "teacher4@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "teacher4@example.com").Id,
                        HireDate = new DateTime(2023, 9, 1)
                    },
                    new Teacher 
                    { 
                        TeacherId = context.Users.First(u => u.Email == "teacher5@example.com").Id,
                        UserId = context.Users.First(u => u.Email == "teacher5@example.com").Id,
                        HireDate = new DateTime(2023, 9, 1)
                    }
                };
                await context.Teachers.AddRangeAsync(teachers);
                await context.SaveChangesAsync();

                // Thêm dữ liệu cho bảng MajorTeacher
                var majorTeachers = new List<MajorTeacher>
                {
                    new MajorTeacher 
                    { 
                        TeacherId = context.Users.First(u => u.Email == "teacher1@example.com").Id,
                        MajorId = 1
                    },
                    new MajorTeacher 
                    { 
                        TeacherId = context.Users.First(u => u.Email == "teacher2@example.com").Id,
                        MajorId = 1
                    },
                    new MajorTeacher 
                    { 
                        TeacherId = context.Users.First(u => u.Email == "teacher3@example.com").Id,
                        MajorId = 1
                    },
                    new MajorTeacher 
                    { 
                        TeacherId = context.Users.First(u => u.Email == "teacher4@example.com").Id,
                        MajorId = 1
                    },
                    new MajorTeacher 
                    { 
                        TeacherId = context.Users.First(u => u.Email == "teacher5@example.com").Id,
                        MajorId = 1
                    }
                };
                await context.MajorTeachers.AddRangeAsync(majorTeachers);
                await context.SaveChangesAsync();
            }
        }

        private static async Task CreateUser(
            UserManager<User> userManager,
            string email,

            // ThaiNH_Modified_Begin

            string fullName,
            //string firstName,
            //string lastName,

            // ThaiNH_Modified_End

            string password,
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
                    // ThaiNH_Modified_UserProfile_Begin

                    Fullname = fullName,
                    //FirstName = firstName,
                    //LastName = lastName,

                    // ThaiNH_Modified_UserProfile_End

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
    }
}
