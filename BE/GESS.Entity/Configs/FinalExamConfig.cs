using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class FinalExamConfig : IEntityTypeConfiguration<FinalExam>
    {
        public void Configure(EntityTypeBuilder<FinalExam> builder)
        {
            // Configure composite key
            builder.HasKey(fe => new { fe.MultiExamId, fe.MultiQuestionId });

            // Configure relationships
            builder.HasOne(fe => fe.MultiExam)
                   .WithMany(me => me.FinalExams)
                   .HasForeignKey(fe => fe.MultiExamId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(fe => fe.MultiQuestion)
                   .WithMany(mq => mq.FinalExams)
                   .HasForeignKey(fe => fe.MultiQuestionId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 