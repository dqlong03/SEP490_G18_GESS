using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class PracticeExamHistoryConfig : IEntityTypeConfiguration<PracticeExamHistory>
    {
        public void Configure(EntityTypeBuilder<PracticeExamHistory> builder)
        {
            // Configure relationships
            builder.HasOne(peh => peh.Student)
                   .WithMany(s => s.PracticeExamHistories)
                   .HasForeignKey(peh => peh.StudentId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(peh => peh.PracticeExam)
                   .WithMany(pe => pe.PracticeExamHistories)
                   .HasForeignKey(peh => peh.PracExamId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(peh => peh.ExamSlotRoom)
                   .WithMany(esr => esr.PracticeExamHistories)
                   .HasForeignKey(peh => peh.ExamSlotRoomId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(peh => peh.QuestionPracExams)
                   .WithOne(qpe => qpe.PracticeExamHistory)
                   .HasForeignKey(qpe => qpe.PracExamHistoryId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(peh => peh.PracticeExamPaper)
                   .WithMany(pep => pep.PracticeExamHistories)
                   .HasForeignKey(peh => peh.PracExamPaperId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 