using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class CohortConfig : IEntityTypeConfiguration<Cohort>
    {
        public void Configure(EntityTypeBuilder<Cohort> builder)
        {
            // Configure relationships
            builder.HasMany(c => c.Students)
                   .WithOne(s => s.Cohort)
                   .HasForeignKey(s => s.CohortId);

            builder.HasMany(c => c.ApplyTrainingPrograms)
                   .WithOne(atp => atp.Cohort)
                   .HasForeignKey(atp => atp.CohortId);
        }
    }
} 