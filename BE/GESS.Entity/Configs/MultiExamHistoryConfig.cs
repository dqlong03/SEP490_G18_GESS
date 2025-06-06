using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class MultiExamHistoryConfig : IEntityTypeConfiguration<MultiExamHistory>
    {
        public void Configure(EntityTypeBuilder<MultiExamHistory> builder)
        {
            // Configure relationships
            builder.HasOne(meh => meh.Student)
                   .WithMany(s => s.MultiExamHistories)
                   .HasForeignKey(meh => meh.StudentId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(meh => meh.MultiExam)
                   .WithMany(me => me.MultiExamHistories)
                   .HasForeignKey(meh => meh.MultiExamId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(meh => meh.ExamSlotRoom)
                   .WithMany(esr => esr.MultiExamHistories)
                   .HasForeignKey(meh => meh.ExamSlotRoomId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(meh => meh.QuestionMultiExams)
                   .WithOne(qme => qme.MultiExamHistory)
                   .HasForeignKey(qme => qme.MultiExamHistoryId);
        }
    }
} 