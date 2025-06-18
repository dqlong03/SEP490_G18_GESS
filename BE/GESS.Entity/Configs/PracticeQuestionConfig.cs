using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class PracticeQuestionConfig : IEntityTypeConfiguration<PracticeQuestion>
    {
        public void Configure(EntityTypeBuilder<PracticeQuestion> builder)
        {
            // Configure relationships
            builder.HasOne(pq => pq.Chapter)
                   .WithMany(c => c.PracticeQuestions)
                   .HasForeignKey(pq => pq.ChapterId);

            builder.HasOne(pq => pq.Semester)
                   .WithMany(s => s.PracticeQuestions)
                   .HasForeignKey(pq => pq.SemesterId);

            builder.HasOne(pq => pq.LevelQuestion)
                   .WithMany(lq => lq.PracticeQuestions)
                   .HasForeignKey(pq => pq.LevelQuestionId);

            builder.HasOne(pq => pq.PracticeAnswer)
                   .WithOne(pa => pa.PracticeQuestion)
                   .HasForeignKey<PracticeAnswer>(pa => pa.PracticeQuestionId);

            builder.HasMany(pq => pq.PracticeTestQuestions)
                   .WithOne(ptq => ptq.PracticeQuestion)
                   .HasForeignKey(ptq => ptq.PracticeQuestionId);

            builder.HasMany(pq => pq.QuestionPracExams)
                   .WithOne(qpe => qpe.PracticeQuestion)
                   .HasForeignKey(qpe => qpe.PracticeQuestionId);
            builder.HasOne(pq => pq.User)
       .WithMany(u => u.PracticeQuestions)
       .HasForeignKey(pq => pq.CreatedBy)
       .OnDelete(DeleteBehavior.Restrict);

        }
    }
} 