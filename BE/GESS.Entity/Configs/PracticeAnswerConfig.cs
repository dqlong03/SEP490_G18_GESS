using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class PracticeAnswerConfig : IEntityTypeConfiguration<PracticeAnswer>
    {
        public void Configure(EntityTypeBuilder<PracticeAnswer> builder)
        {
            // Configure relationships
            builder.HasOne(pa => pa.PracticeQuestion)
                   .WithOne(pq => pq.PracticeAnswer)
                   .HasForeignKey<PracticeAnswer>(pa => pa.PracticeQuestionId);
        }
    }
} 