using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class QuestionMultiExamConfig : IEntityTypeConfiguration<QuestionMultiExam>
    {
        public void Configure(EntityTypeBuilder<QuestionMultiExam> builder)
        {
            builder.HasKey(qme => new { qme.MultiExamHistoryId, qme.MultiQuestionId });

            builder.Property(qme => qme.MultiExamHistoryId)
                .HasColumnType("uniqueidentifier");

            builder.Property(qme => qme.MultiQuestionId)
                .HasColumnType("int");

            builder.HasOne(qme => qme.MultiExamHistory)
                .WithMany(meh => meh.QuestionMultiExams)
                .HasForeignKey(qme => qme.MultiExamHistoryId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(qme => qme.MultiQuestion)
                .WithMany(mq => mq.QuestionMultiExams)
                .HasForeignKey(qme => qme.MultiQuestionId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 