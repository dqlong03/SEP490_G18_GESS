using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configurations
{
    public class ExamSlotConfiguration : IEntityTypeConfiguration<ExamSlot>
    {
        public void Configure(EntityTypeBuilder<ExamSlot> builder)
        {
            // Khóa chính
            builder.HasKey(es => es.ExamSlotId);

            // Tên bảng nếu muốn custom
            builder.ToTable("ExamSlot");

            // Cấu hình SlotName
            builder.Property(es => es.SlotName)
                .IsRequired()
                .HasMaxLength(50);

            // StartTime, EndTime kiểu time
            builder.Property(es => es.StartTime)
                .IsRequired()
                .HasColumnType("time");

            builder.Property(es => es.EndTime)
                .IsRequired()
                .HasColumnType("time");

            // Status - default "Chưa gán bài thi"
            builder.Property(es => es.Status)
                .IsRequired()
                .HasDefaultValue("Chưa gán bài thi")
                .HasMaxLength(100);

            // MultiOrPractice có thể null nhưng set max length
            builder.Property(es => es.MultiOrPractice)
                .HasMaxLength(50);

            // ExamDate kiểu date/datetime
            builder.Property(es => es.ExamDate)
                .HasColumnType("date");

            // Quan hệ với ExamSlotRoom (1-n)
            builder.HasMany(es => es.ExamSlotRooms)
                .WithOne(esr => esr.ExamSlot)
                .HasForeignKey(esr => esr.ExamSlotId)
                .OnDelete(DeleteBehavior.Cascade);

            // Các khóa ngoại khác nếu có bảng tương ứng
            // Ví dụ:
            // builder.HasOne<Subject>()
            //     .WithMany()
            //     .HasForeignKey(es => es.SubjectId)
            //     .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
