using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class NoPEPaperInPEConfig : IEntityTypeConfiguration<NoPEPaperInPE>
    {
        public void Configure(EntityTypeBuilder<NoPEPaperInPE> builder)
        {
            // Configure composite key
            builder.HasKey(np => new { np.PracExamId, np.PracExamPaperId });

            // Configure relationships
            builder.HasOne(np => np.PracticeExam)
                   .WithMany(pe => pe.NoPEPaperInPEs)
                   .HasForeignKey(np => np.PracExamId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(np => np.PracticeExamPaper)
                   .WithMany(pep => pep.NoPEPaperInPEs)
                   .HasForeignKey(np => np.PracExamPaperId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
} 