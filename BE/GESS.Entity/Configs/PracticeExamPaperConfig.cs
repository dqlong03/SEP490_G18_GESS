using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class PracticeExamPaperConfig : IEntityTypeConfiguration<PracticeExamPaper>
    {
        public void Configure(EntityTypeBuilder<PracticeExamPaper> builder)
        {
            // Configure relationships
            builder.HasOne(pep => pep.Subject)
                   .WithMany(s => s.PracticeExamPapers)
                   .HasForeignKey(pep => pep.SubjectId);

            builder.HasOne(pep => pep.Semester)
                   .WithMany(s => s.PracticeExamPapers)
                   .HasForeignKey(pep => pep.SemesterId);

            builder.HasOne(pep => pep.CategoryExam)
                   .WithMany(ce => ce.PracticeExamPapers)
                   .HasForeignKey(pep => pep.CategoryExamId);

            builder.HasMany(pep => pep.PracticeTestQuestions)
                   .WithOne(ptq => ptq.PracticeExamPaper)
                   .HasForeignKey(ptq => ptq.PracExamPaperId);

            builder.HasMany(pep => pep.NoPEPaperInPEs)
                   .WithOne(np => np.PracticeExamPaper)
                   .HasForeignKey(np => np.PracExamPaperId);

            builder.HasMany(pep => pep.PracticeExamHistories)
                   .WithOne(peh => peh.PracticeExamPaper)
                   .HasForeignKey(peh => peh.PracExamPaperId);
        }
    }
} 