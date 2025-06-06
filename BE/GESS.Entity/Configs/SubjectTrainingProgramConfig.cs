using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class SubjectTrainingProgramConfig : IEntityTypeConfiguration<SubjectTrainingProgram>
    {
        public void Configure(EntityTypeBuilder<SubjectTrainingProgram> builder)
        {
            // Configure relationships
            builder.HasOne(stp => stp.Subject)
                   .WithMany(s => s.SubjectTrainingPrograms)
                   .HasForeignKey(stp => stp.SubjectId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(stp => stp.TrainingProgram)
                   .WithMany(tp => tp.SubjectTrainingPrograms)
                   .HasForeignKey(stp => stp.TrainProId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(stp => stp.PreconditionSubjects)
                   .WithOne(ps => ps.SubjectTrainingProgram)
                   .HasForeignKey(ps => ps.SubTrainingProgramId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
} 