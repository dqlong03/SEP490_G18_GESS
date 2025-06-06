using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class TrainingProgramConfig : IEntityTypeConfiguration<TrainingProgram>
    {
        public void Configure(EntityTypeBuilder<TrainingProgram> builder)
        {
            // Configure relationships
            builder.HasOne(tp => tp.Major)
                   .WithMany(m => m.TrainingPrograms)
                   .HasForeignKey(tp => tp.MajorId);

            builder.HasMany(tp => tp.SubjectTrainingPrograms)
                   .WithOne(stp => stp.TrainingProgram)
                   .HasForeignKey(stp => stp.TrainProId);

            builder.HasMany(tp => tp.ApplyTrainingPrograms)
                   .WithOne(atp => atp.TrainingProgram)
                   .HasForeignKey(atp => atp.TrainProId);
        }
    }
} 