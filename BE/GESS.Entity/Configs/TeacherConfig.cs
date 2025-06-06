using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class TeacherConfig : IEntityTypeConfiguration<Teacher>
    {
        public void Configure(EntityTypeBuilder<Teacher> builder)
        {
            // Configure relationships
            builder.HasOne(t => t.User)
                   .WithOne(u => u.Teacher)
                   .HasForeignKey<Teacher>(t => t.UserId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(t => t.MajorTeachers)
                   .WithOne(mt => mt.Teacher)
                   .HasForeignKey(mt => mt.TeacherId);

            builder.HasMany(t => t.Classes)
                   .WithOne(c => c.Teacher)
                   .HasForeignKey(c => c.TeacherId);

            builder.HasOne(t => t.ExamSlotRoomSupervisor)
                   .WithOne(esr => esr.Supervisor)
                   .HasForeignKey<ExamSlotRoom>(esr => esr.SupervisorId);

            builder.HasOne(t => t.ExamSlotRoomGrader)
                   .WithOne(esr => esr.ExamGrader)
                   .HasForeignKey<ExamSlotRoom>(esr => esr.ExamGradedId);
        }
    }
} 