using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class MultiExamConfig : IEntityTypeConfiguration<MultiExam>
    {
        public void Configure(EntityTypeBuilder<MultiExam> builder)
        {
            // Configure relationships
            builder.HasOne(me => me.Subject)
                   .WithMany(s => s.MultiExams)
                   .HasForeignKey(me => me.SubjectId);

            builder.HasOne(me => me.Semester)
                   .WithMany(s => s.MultiExams)
                   .HasForeignKey(me => me.SemesterId);

            builder.HasOne(me => me.CategoryExam)
                   .WithMany(ce => ce.MultiExams)
                   .HasForeignKey(me => me.CategoryExamId);

            builder.HasOne(me => me.Class)
                   .WithMany(c => c.MultiExams)
                   .HasForeignKey(me => me.ClassId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(me => me.NoQuestionInChapters)
                   .WithOne(nq => nq.MultiExam)
                   .HasForeignKey(nq => nq.MultiExamId);

            builder.HasMany(me => me.FinalExams)
                   .WithOne(fe => fe.MultiExam)
                   .HasForeignKey(fe => fe.MultiExamId);

            builder.HasMany(me => me.MultiExamHistories)
                   .WithOne(meh => meh.MultiExam)
                   .HasForeignKey(meh => meh.MultiExamId);
        }
    }
} 