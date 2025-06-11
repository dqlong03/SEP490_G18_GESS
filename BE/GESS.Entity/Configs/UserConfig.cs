using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;

namespace GESS.Entity.Configs
{
    public class UserConfig : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.IsDeleted)
                .HasDefaultValue(false);

            builder.Property(x => x.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(x => x.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // ThaiNH_Modified_UserProfile_Begin
            //builder.Property(x => x.FirstName)
            //    .HasMaxLength(200);
            //builder.Property(x => x.LastName)
            //    .HasMaxLength(200);
            //builder.Property(x => x.DateOfBirth)
            //    .IsRequired();
            //    .HasMaxLength(12);
            //builder.Property(x => x.PhoneNumber)

            // ThaiNH_Modified_UserProfile_End


            builder.Property(x => x.Email)
                .IsRequired()
                .HasMaxLength(256);

            builder.Property(x => x.Gender)
                .IsRequired();

            builder.Property(x => x.IsActive)
                .IsRequired()
                .HasDefaultValue(true);
        }
    }
}