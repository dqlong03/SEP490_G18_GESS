using GESS.Entity.Entities;
using Microsoft.AspNetCore.Identity;
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
            // Lấy UserManager và RoleManager từ DI
            using var scope = serviceProvider.CreateScope();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

            // Tạo các role nếu chưa tồn tại
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

            // Tạo user mẫu và gán role
            await CreateUser(userManager, "admin@example.com", "Admin User", "Admin", "Password123!", new DateTime(1980, 1, 1), "1234567890", true, "Admin");
            await CreateUser(userManager, "teacher1@example.com", "Teacher One", "Teacher", "Password123!", new DateTime(1985, 5, 10), "0987654321", false, "Teacher");
            await CreateUser(userManager, "student1@example.com", "Student One", "Student", "Password123!", new DateTime(2000, 8, 15), "0123456789", true, "Student");
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
            // Kiểm tra xem user đã tồn tại chưa
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
                    EmailConfirmed = true // Giả lập email đã xác nhận
                };

                // Tạo user
                var result = await userManager.CreateAsync(user, password);
                if (!result.Succeeded)
                {
                    throw new Exception($"Failed to create user {email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }

                // Gán role cho user
                var roleResult = await userManager.AddToRoleAsync(user, role);
                if (!roleResult.Succeeded)
                {
                    throw new Exception($"Failed to assign role {role} to user {email}: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
                }
            }
        }
    }
}
