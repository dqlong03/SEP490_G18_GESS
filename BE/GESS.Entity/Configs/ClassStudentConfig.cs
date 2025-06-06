using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class ClassStudentConfig : IEntityTypeConfiguration<ClassStudent>
    {
        public void Configure(EntityTypeBuilder<ClassStudent> builder)
        {
            // Configure composite key
            builder.HasKey(cs => new { cs.ClassId, cs.StudentId });

            // Configure relationships
            builder.HasOne(cs => cs.Class)
                   .WithMany(c => c.ClassStudents)
                   .HasForeignKey(cs => cs.ClassId);

            builder.HasOne(cs => cs.Student)
                   .WithMany(s => s.ClassStudents)
                   .HasForeignKey(cs => cs.StudentId);
        }
    }
} 