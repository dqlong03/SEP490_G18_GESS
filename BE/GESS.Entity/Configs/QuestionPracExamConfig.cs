using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class QuestionPracExamConfig : IEntityTypeConfiguration<QuestionPracExam>
    {
        public void Configure(EntityTypeBuilder<QuestionPracExam> builder)
        {
            // Configure composite key
            builder.HasKey(qpe => new { qpe.PracExamHistoryId, qpe.PracticeQuestionId });

            // Configure relationships
            builder.HasOne(qpe => qpe.PracticeExamHistory)
                   .WithMany(peh => peh.QuestionPracExams)
                   .HasForeignKey(qpe => qpe.PracExamHistoryId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(qpe => qpe.PracticeQuestion)
                   .WithMany(pq => pq.QuestionPracExams)
                   .HasForeignKey(qpe => qpe.PracticeQuestionId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 