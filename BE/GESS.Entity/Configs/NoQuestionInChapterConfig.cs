using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class NoQuestionInChapterConfig : IEntityTypeConfiguration<NoQuestionInChapter>
    {
        public void Configure(EntityTypeBuilder<NoQuestionInChapter> builder)
        {
            builder.HasKey(nq => nq.NoQuesInChapId);

            builder.HasOne(nq => nq.Chapter)
                .WithMany(c => c.NoQuestionInChapters)
                .HasForeignKey(nq => nq.ChapterId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(nq => nq.MultiExam)
                .WithMany(me => me.NoQuestionInChapters)
                .HasForeignKey(nq => nq.MultiExamId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 