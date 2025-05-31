using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            // Cấu hình khóa chính
            builder.HasKey(rt => rt.Id);

            // Cấu hình quan hệ 1-nhiều với User
            builder.HasOne(rt => rt.User)
                   .WithMany(u => u.RefreshTokens) // Đảm bảo User có RefreshTokens
                   .HasForeignKey(rt => rt.UserId);

            // Cấu hình các thuộc tính (tùy chọn)
            builder.Property(rt => rt.Token).IsRequired().HasMaxLength(500);
            builder.Property(rt => rt.IssuedAt).IsRequired();
            builder.Property(rt => rt.ExpiresAt).IsRequired();
            builder.Property(rt => rt.IsRevoked).HasDefaultValue(false);
        }
    }
}