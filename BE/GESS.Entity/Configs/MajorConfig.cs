using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class MajorConfig : IEntityTypeConfiguration<Major>
    {
        public void Configure(EntityTypeBuilder<Major> builder)
        {
            // Configure relationships
            builder.HasMany(m => m.TrainingPrograms)
                   .WithOne(tp => tp.Major)
                   .HasForeignKey(tp => tp.MajorId);

            //builder.HasMany(m => m.MajorTeachers)
            //       .WithOne(mt => mt.Major)
            //       .HasForeignKey(mt => mt.MajorId);

            builder.HasMany(t => t.Teachers)
                  .WithOne(m => m.Major)
                  .HasForeignKey(m => m.MajorId);
        }
    }
} 