using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class ClassConfig : IEntityTypeConfiguration<Class>
    {
        public void Configure(EntityTypeBuilder<Class> builder)
        {
            // Configure relationships
            builder.HasOne(c => c.Subject)
                   .WithMany(s => s.Classes)
                   .HasForeignKey(c => c.SubjectId);

            builder.HasOne(c => c.Teacher)
                   .WithMany(t => t.Classes)
                   .HasForeignKey(c => c.TeacherId);

            builder.HasOne(c => c.Semester)
                   .WithMany(s => s.Classes)
                   .HasForeignKey(c => c.SemesterId);

            builder.HasMany(c => c.ClassStudents)
                   .WithOne(cs => cs.Class)
                   .HasForeignKey(cs => cs.ClassId);

            builder.HasMany(c => c.MultiExams)
                   .WithOne(me => me.Class)
                   .HasForeignKey(me => me.ClassId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(c => c.PracticeExams)
                   .WithOne(pe => pe.Class)
                   .HasForeignKey(pe => pe.ClassId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 