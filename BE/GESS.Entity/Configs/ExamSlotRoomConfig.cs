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
                   .WithMany(s => s.ExamSlotRooms) 
                   .HasForeignKey(esr => esr.SubjectId)
                   .IsRequired(true);


            builder.HasOne(esr => esr.Supervisor)
                   .WithMany(t => t.ExamSlotRoomSupervisors)
                   .HasForeignKey(esr => esr.SupervisorId)
                   .OnDelete(DeleteBehavior.Restrict)
                   .IsRequired(false); 

            builder.HasOne(esr => esr.ExamGrader)
                   .WithMany(t => t.ExamSlotRoomGraders)
                   .HasForeignKey(esr => esr.ExamGradedId)
                   .OnDelete(DeleteBehavior.Restrict)
                   .IsRequired(false); 

            builder.HasOne(esr => esr.PracticeExam)
                   .WithOne(pe => pe.ExamSlotRoom)
                   .HasForeignKey<ExamSlotRoom>(esr => esr.PracticeExamId)
                   .OnDelete(DeleteBehavior.Restrict)
                   .IsRequired(false); 

            builder.HasOne(esr => esr.MultiExam)
                   .WithOne(me => me.ExamSlotRoom)
                   .HasForeignKey<ExamSlotRoom>(esr => esr.MultiExamId)
                   .OnDelete(DeleteBehavior.Restrict)
                   .IsRequired(false); 
        }
    }
}
