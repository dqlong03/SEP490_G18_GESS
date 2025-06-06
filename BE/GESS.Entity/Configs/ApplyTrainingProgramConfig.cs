using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class ApplyTrainingProgramConfig : IEntityTypeConfiguration<ApplyTrainingProgram>
    {
        public void Configure(EntityTypeBuilder<ApplyTrainingProgram> builder)
        {
            // Configure composite key
            builder.HasKey(atp => new { atp.TrainProId, atp.CohortId });

            // Configure relationships
            builder.HasOne(atp => atp.TrainingProgram)
                   .WithMany(tp => tp.ApplyTrainingPrograms)
                   .HasForeignKey(atp => atp.TrainProId);

            builder.HasOne(atp => atp.Cohort)
                   .WithMany(c => c.ApplyTrainingPrograms)
                   .HasForeignKey(atp => atp.CohortId);
        }
    }
} 