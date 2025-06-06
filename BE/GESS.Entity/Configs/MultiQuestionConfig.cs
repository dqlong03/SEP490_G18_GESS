using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class MultiQuestionConfig : IEntityTypeConfiguration<MultiQuestion>
    {
        public void Configure(EntityTypeBuilder<MultiQuestion> builder)
        {
            // Configure relationships
            builder.HasOne(mq => mq.Chapter)
                   .WithMany(c => c.MultiQuestions)
                   .HasForeignKey(mq => mq.ChapterId);

            builder.HasOne(mq => mq.Semester)
                   .WithMany(s => s.MultiQuestions)
                   .HasForeignKey(mq => mq.SemesterId);

            builder.HasOne(mq => mq.LevelQuestion)
                   .WithMany(lq => lq.MultiQuestions)
                   .HasForeignKey(mq => mq.LevelQuestionId);

            builder.HasOne(mq => mq.CategoryExam)
                   .WithMany(ce => ce.MultiQuestions)
                   .HasForeignKey(mq => mq.CategoryExamId);

            builder.HasMany(mq => mq.MultiAnswers)
                   .WithOne(ma => ma.MultiQuestion)
                   .HasForeignKey(ma => ma.MultiQuestionId);

            builder.HasMany(mq => mq.FinalExams)
                   .WithOne(fe => fe.MultiQuestion)
                   .HasForeignKey(fe => fe.MultiQuestionId);

            builder.HasMany(mq => mq.QuestionMultiExams)
                   .WithOne(qme => qme.MultiQuestion)
                   .HasForeignKey(qme => qme.MultiQuestionId);
        }
    }
} 