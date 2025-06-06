using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class MajorTeacherConfig : IEntityTypeConfiguration<MajorTeacher>
    {
        public void Configure(EntityTypeBuilder<MajorTeacher> builder)
        {
            // Configure composite key
            builder.HasKey(mt => new { mt.MajorId, mt.TeacherId });

            // Configure relationships
            builder.HasOne(mt => mt.Major)
                   .WithMany(m => m.MajorTeachers)
                   .HasForeignKey(mt => mt.MajorId);

            builder.HasOne(mt => mt.Teacher)
                   .WithMany(t => t.MajorTeachers)
                   .HasForeignKey(mt => mt.TeacherId);
        }
    }
} 