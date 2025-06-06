using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class LevelQuestionConfig : IEntityTypeConfiguration<LevelQuestion>
    {
        public void Configure(EntityTypeBuilder<LevelQuestion> builder)
        {
            // Configure relationships
            builder.HasMany(lq => lq.MultiQuestions)
                   .WithOne(mq => mq.LevelQuestion)
                   .HasForeignKey(mq => mq.LevelQuestionId);

            builder.HasMany(lq => lq.PracticeQuestions)
                   .WithOne(pq => pq.LevelQuestion)
                   .HasForeignKey(pq => pq.LevelQuestionId);
        }
    }
} 