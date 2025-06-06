using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class CategoryExamConfig : IEntityTypeConfiguration<CategoryExam>
    {
        public void Configure(EntityTypeBuilder<CategoryExam> builder)
        {
            // Configure relationships
            builder.HasMany(ce => ce.CategoryExamSubjects)
                   .WithOne(ces => ces.CategoryExam)
                   .HasForeignKey(ces => ces.CategoryExamId);

            builder.HasMany(ce => ce.MultiQuestions)
                   .WithOne(mq => mq.CategoryExam)
                   .HasForeignKey(mq => mq.CategoryExamId);

            builder.HasMany(ce => ce.MultiExams)
                   .WithOne(me => me.CategoryExam)
                   .HasForeignKey(me => me.CategoryExamId);

            builder.HasMany(ce => ce.PracticeExams)
                   .WithOne(pe => pe.CategoryExam)
                   .HasForeignKey(pe => pe.CategoryExamId);

            builder.HasMany(ce => ce.PracticeExamPapers)
                   .WithOne(pep => pep.CategoryExam)
                   .HasForeignKey(pep => pep.CategoryExamId);
        }
    }
} 