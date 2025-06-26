using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class StudentExamSlotRoomConfig : IEntityTypeConfiguration<StudentExamSlotRoom>
    {
        public void Configure(EntityTypeBuilder<StudentExamSlotRoom> builder)
        {
            // Configure relationships
            builder.HasOne(esr => esr.Student)
                   .WithMany(r => r.StudentExamSlotRooms)
                   .HasForeignKey(esr => esr.StudentId);

            builder.HasOne(esr => esr.ExamSlotRoom)
                   .WithMany(es => es.StudentExamSlotRooms)
                   .HasForeignKey(esr => esr.ExamSlotRoomId);
        }
    }
}
