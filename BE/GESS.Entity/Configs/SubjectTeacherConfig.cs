using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class SubjectTeacherConfig : IEntityTypeConfiguration<SubjectTeacher>
    {
        public void Configure(EntityTypeBuilder<SubjectTeacher> builder)
        {
            // Tên bảng
            builder.ToTable("SubjectTeachers");

            // Khóa chính tổng hợp (SubjectId + TeacherId)
            builder.HasKey(st => new { st.SubjectId, st.TeacherId });

            // Liên kết với Subject
            builder.HasOne(st => st.Subject)
                   .WithMany() // nếu trong Subject không có ICollection<SubjectTeacher>
                   .HasForeignKey(st => st.SubjectId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Liên kết với Teacher
            builder.HasOne(st => st.Teacher)
                   .WithMany() // nếu trong Teacher không có ICollection<SubjectTeacher>
                   .HasForeignKey(st => st.TeacherId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Mặc định cho 2 cờ boolean
            builder.Property(st => st.IsGradeTeacher)
                   .HasDefaultValue(false);

            builder.Property(st => st.IsCreateExamTeacher)
                   .HasDefaultValue(false);

            builder.Property(st => st.IsActiveSubjectTeacher)
                   .HasDefaultValue(false);
        }
    }
}
