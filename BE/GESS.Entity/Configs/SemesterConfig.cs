using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class SemesterConfig : IEntityTypeConfiguration<Semester>
    {
        public void Configure(EntityTypeBuilder<Semester> builder)
        {
            // Configure relationships
            builder.HasMany(s => s.Classes)
                   .WithOne(c => c.Semester)
                   .HasForeignKey(c => c.SemesterId);

            builder.HasMany(s => s.PracticeExamPapers)
                   .WithOne(pep => pep.Semester)
                   .HasForeignKey(pep => pep.SemesterId);

            builder.HasMany(s => s.MultiQuestions)
                   .WithOne(mq => mq.Semester)
                   .HasForeignKey(mq => mq.SemesterId);

            builder.HasMany(s => s.PracticeQuestions)
                   .WithOne(pq => pq.Semester)
                   .HasForeignKey(pq => pq.SemesterId);

            builder.HasMany(s => s.PracticeExams)
                   .WithOne(pe => pe.Semester)
                   .HasForeignKey(pe => pe.SemesterId);

            builder.HasMany(s => s.ExamSlotRooms)
                   .WithOne(esr => esr.Semester)
                   .HasForeignKey(esr => esr.SemesterId);

            builder.HasMany(s => s.MultiExams)
                   .WithOne(me => me.Semester)
                   .HasForeignKey(me => me.SemesterId);
        }
    }
} 