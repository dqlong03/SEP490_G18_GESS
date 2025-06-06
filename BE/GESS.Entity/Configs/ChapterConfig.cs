using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class ChapterConfig : IEntityTypeConfiguration<Chapter>
    {
        public void Configure(EntityTypeBuilder<Chapter> builder)
        {
            // Configure relationships
            builder.HasOne(c => c.Subject)
                   .WithMany(s => s.Chapters)
                   .HasForeignKey(c => c.SubjectId);

            builder.HasMany(c => c.MultiQuestions)
                   .WithOne(mq => mq.Chapter)
                   .HasForeignKey(mq => mq.ChapterId);

            builder.HasMany(c => c.PracticeQuestions)
                   .WithOne(pq => pq.Chapter)
                   .HasForeignKey(pq => pq.ChapterId);

            builder.HasMany(c => c.NoQuestionInChapters)
                   .WithOne(nq => nq.Chapter)
                   .HasForeignKey(nq => nq.ChapterId);
        }
    }
} 