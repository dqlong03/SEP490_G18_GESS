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
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Áp dụng cấu hình từ assembly nếu cần
            modelBuilder.ApplyConfiguration(new UserConfig());
            modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());
        }
    }
}