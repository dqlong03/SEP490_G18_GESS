using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class ExamSlotRoomConfig : IEntityTypeConfiguration<ExamSlotRoom>
    {
        public void Configure(EntityTypeBuilder<ExamSlotRoom> builder)
        {
            // Configure relationships
            builder.HasOne(esr => esr.Room)
                   .WithMany(r => r.ExamSlotRooms)
                   .HasForeignKey(esr => esr.RoomId);

            builder.HasOne(esr => esr.ExamSlot)
                   .WithMany(es => es.ExamSlotRooms)
                   .HasForeignKey(esr => esr.ExamSlotId);

            builder.HasOne(esr => esr.Semester)
                   .WithMany(s => s.ExamSlotRooms)
                   .HasForeignKey(esr => esr.SemesterId);

            builder.HasOne(esr => esr.Subject)
                   .WithOne(s => s.ExamSlotRoom)
                   .HasForeignKey<ExamSlotRoom>(esr => esr.SubjectId);

            builder.HasOne(esr => esr.Supervisor)
                   .WithOne(t => t.ExamSlotRoomSupervisor)
                   .HasForeignKey<ExamSlotRoom>(esr => esr.SupervisorId);

            builder.HasOne(esr => esr.ExamGrader)
                   .WithOne(t => t.ExamSlotRoomGrader)
                   .HasForeignKey<ExamSlotRoom>(esr => esr.ExamGradedId);

            builder.HasOne(esr => esr.PracticeExam)
                   .WithOne(pe => pe.ExamSlotRoom)
                   .HasForeignKey<ExamSlotRoom>(esr => esr.ExamId);

            builder.HasOne(esr => esr.MultiExam)
                   .WithOne(me => me.ExamSlotRoom)
                   .HasForeignKey<ExamSlotRoom>(esr => esr.ExamId);
        }
    }
} 