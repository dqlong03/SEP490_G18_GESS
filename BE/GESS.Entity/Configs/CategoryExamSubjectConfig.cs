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

            //ThaiNH_Modified_UserProfile_Begin
            builder.HasOne(ces => ces.CategoryExam)
            .WithMany(ce => ce.CategoryExamSubjects)
            .HasForeignKey(ces => ces.CategoryExamId)
            .OnDelete(DeleteBehavior.Cascade); // Xóa tất cả CategoryExamSubject khi CategoryExam bị xóa

            builder.HasOne(ces => ces.Subject)
                .WithMany(s => s.CategoryExamSubjects)
                .HasForeignKey(ces => ces.SubjectId)
                .OnDelete(DeleteBehavior.Cascade); // Xóa tất cả CategoryExamSubject khi Subject bị xóa
            //ThaiNH_Modified_UserProfile_End

        }
    }
}