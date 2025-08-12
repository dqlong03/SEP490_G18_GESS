using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{ 
    public class ExamSlotConfig : IEntityTypeConfiguration<ExamSlot>
    {
        public void Configure(EntityTypeBuilder<ExamSlot> builder)
        {
            // Khóa chính
            builder.HasKey(es => es.ExamSlotId);

            builder.ToTable("ExamSlot");

            // SlotName
            builder.Property(es => es.SlotName)
                .IsRequired()
                .HasMaxLength(50);

            // StartTime / EndTime
            builder.Property(es => es.StartTime)
                .IsRequired()
                .HasColumnType("time");

            builder.Property(es => es.EndTime)
                .IsRequired()
                .HasColumnType("time");

            // Status
            builder.Property(es => es.Status)
                .IsRequired()
                .HasMaxLength(100)
                .HasDefaultValue("Chưa gán bài thi");

            // MultiOrPractice optional
            builder.Property(es => es.MultiOrPractice)
                .HasMaxLength(50)
                .IsRequired(false);

            // ExamDate
            builder.Property(es => es.ExamDate)
                .HasColumnType("date")
                .IsRequired();

            // Quan hệ với Subject (bắt buộc) - không cascade xóa
            builder.HasOne(es => es.Subject)
                .WithMany() // giả sử Subject không cần biết về ExamSlot ngược lại, nếu có navigation thì thay bằng .WithMany(s => s.ExamSlots)
                .HasForeignKey(es => es.SubjectId)
                .OnDelete(DeleteBehavior.Restrict);

            // Quan hệ với Semester (bắt buộc)
            builder.HasOne(es => es.Semester)
                .WithMany()
                .HasForeignKey(es => es.SemesterId)
                .OnDelete(DeleteBehavior.Restrict);

            // Quan hệ với PracticeExam (nếu có)
            builder.HasOne(es => es.PracticeExam)
                .WithMany()
                .HasForeignKey(es => es.PracticeExamId)
                .OnDelete(DeleteBehavior.Restrict); 

            // Quan hệ với MultiExam (nếu có)
            builder.HasOne(es => es.MultiExam)
                .WithMany()
                .HasForeignKey(es => es.MultiExamId)
                .OnDelete(DeleteBehavior.Restrict);


            // Quan hệ với ExamSlotRoom (1-n)
            builder.HasMany(es => es.ExamSlotRooms)
                .WithOne(esr => esr.ExamSlot)
                .HasForeignKey(esr => esr.ExamSlotId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
