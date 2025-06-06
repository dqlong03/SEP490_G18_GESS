using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class PreconditionSubjectConfig : IEntityTypeConfiguration<PreconditionSubject>
    {
        public void Configure(EntityTypeBuilder<PreconditionSubject> builder)
        {
            // Configure composite key
            builder.HasKey(ps => new { ps.SubTrainingProgramId, ps.PreconditionSubjectId });

            // Configure relationships
            builder.HasOne(ps => ps.SubjectTrainingProgram)
                   .WithMany(stp => stp.PreconditionSubjects)
                   .HasForeignKey(ps => ps.SubTrainingProgramId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(ps => ps.PreSubject)
                   .WithMany(s => s.PreconditionSubjects)
                   .HasForeignKey(ps => ps.PreconditionSubjectId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
} 