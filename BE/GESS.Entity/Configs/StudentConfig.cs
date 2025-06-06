using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class StudentConfig : IEntityTypeConfiguration<Student>
    {
        public void Configure(EntityTypeBuilder<Student> builder)
        {
            // Configure relationships
            builder.HasOne(s => s.User)
                   .WithOne(u => u.Student)
                   .HasForeignKey<Student>(s => s.UserId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(s => s.Cohort)
                   .WithMany(c => c.Students)
                   .HasForeignKey(s => s.CohortId);

            builder.HasMany(s => s.ClassStudents)
                   .WithOne(cs => cs.Student)
                   .HasForeignKey(cs => cs.StudentId);

            builder.HasMany(s => s.MultiExamHistories)
                   .WithOne(meh => meh.Student)
                   .HasForeignKey(meh => meh.StudentId);

            builder.HasMany(s => s.PracticeExamHistories)
                   .WithOne(peh => peh.Student)
                   .HasForeignKey(peh => peh.StudentId);
        }
    }
} 