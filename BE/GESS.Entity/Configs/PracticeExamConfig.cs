using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class PracticeExamConfig : IEntityTypeConfiguration<PracticeExam>
    {
        public void Configure(EntityTypeBuilder<PracticeExam> builder)
        {
            // Configure relationships
            builder.HasOne(pe => pe.Subject)
                   .WithMany(s => s.PracticeExams)
                   .HasForeignKey(pe => pe.SubjectId);

            builder.HasOne(pe => pe.Semester)
                   .WithMany(s => s.PracticeExams)
                   .HasForeignKey(pe => pe.SemesterId);

            builder.HasOne(pe => pe.CategoryExam)
                   .WithMany(ce => ce.PracticeExams)
                   .HasForeignKey(pe => pe.CategoryExamId);

            builder.HasOne(pe => pe.Class)
                   .WithMany(c => c.PracticeExams)
                   .HasForeignKey(pe => pe.ClassId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(pe => pe.NoPEPaperInPEs)
                   .WithOne(np => np.PracticeExam)
                   .HasForeignKey(np => np.PracExamId);

            builder.HasMany(pe => pe.PracticeExamHistories)
                   .WithOne(peh => peh.PracticeExam)
                   .HasForeignKey(peh => peh.PracExamId);
        }
    }
} 