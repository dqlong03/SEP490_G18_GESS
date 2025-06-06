using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class PracticeTestQuestionConfig : IEntityTypeConfiguration<PracticeTestQuestion>
    {
        public void Configure(EntityTypeBuilder<PracticeTestQuestion> builder)
        {
            // Configure composite key
            builder.HasKey(ptq => new { ptq.PracExamPaperId, ptq.PracticeQuestionId });

            // Configure relationships
            builder.HasOne(ptq => ptq.PracticeExamPaper)
                   .WithMany(pep => pep.PracticeTestQuestions)
                   .HasForeignKey(ptq => ptq.PracExamPaperId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ptq => ptq.PracticeQuestion)
                   .WithMany(pq => pq.PracticeTestQuestions)
                   .HasForeignKey(ptq => ptq.PracticeQuestionId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 