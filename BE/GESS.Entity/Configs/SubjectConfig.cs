using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class SubjectConfig : IEntityTypeConfiguration<Subject>
    {
        public void Configure(EntityTypeBuilder<Subject> builder)
        {
            // Configure relationships
            builder.HasMany(s => s.Chapters)
                   .WithOne(c => c.Subject)
                   .HasForeignKey(c => c.SubjectId);

            builder.HasMany(s => s.MultiExams)
                   .WithOne(me => me.Subject)
                   .HasForeignKey(me => me.SubjectId);

            builder.HasMany(s => s.PracticeExams)
                   .WithOne(pe => pe.Subject)
                   .HasForeignKey(pe => pe.SubjectId);

            builder.HasMany(s => s.PracticeExamPapers)
                   .WithOne(pep => pep.Subject)
                   .HasForeignKey(pep => pep.SubjectId);

            builder.HasMany(s => s.Classes)
                   .WithOne(c => c.Subject)
                   .HasForeignKey(c => c.SubjectId);

            builder.HasMany(s => s.SubjectTrainingPrograms)
                   .WithOne(stp => stp.Subject)
                   .HasForeignKey(stp => stp.SubjectId);

            builder.HasMany(s => s.CategoryExamSubjects)
                   .WithOne(ces => ces.Subject)
                   .HasForeignKey(ces => ces.SubjectId);

            builder.HasMany(s => s.PreconditionSubjects)
                   .WithOne(ps => ps.PreSubject)
                   .HasForeignKey(ps => ps.PreconditionSubjectId);
        }
    }
} 