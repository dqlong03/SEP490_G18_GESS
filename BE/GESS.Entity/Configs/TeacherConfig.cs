using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class TeacherConfig : IEntityTypeConfiguration<Teacher>
    {
        public void Configure(EntityTypeBuilder<Teacher> builder)
        {
            // Configure relationships
            builder.HasOne(t => t.User)
                   .WithOne(u => u.Teacher)
                   .HasForeignKey<Teacher>(t => t.UserId)
                   .OnDelete(DeleteBehavior.Restrict);

            //builder.HasMany(t => t.MajorTeachers)
            //       .WithOne(mt => mt.Teacher)
            //       .HasForeignKey(mt => mt.TeacherId);

            builder.HasOne(t => t.Major)
                   .WithMany(m => m.Teachers)
                   .HasForeignKey(t => t.MajorId);

            builder.HasMany(t => t.Classes)
                   .WithOne(c => c.Teacher)
                   .HasForeignKey(c => c.TeacherId);

        }
    }
} 