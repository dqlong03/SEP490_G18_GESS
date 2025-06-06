using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class CategoryExamSubjectConfig : IEntityTypeConfiguration<CategoryExamSubject>
    {
        public void Configure(EntityTypeBuilder<CategoryExamSubject> builder)
        {
            builder.HasKey(ces => new { ces.CategoryExamId, ces.SubjectId });

            builder.HasOne(ces => ces.CategoryExam)
                .WithMany(ce => ce.CategoryExamSubjects)
                .HasForeignKey(ces => ces.CategoryExamId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(ces => ces.Subject)
                .WithMany(s => s.CategoryExamSubjects)
                .HasForeignKey(ces => ces.SubjectId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 