using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class RoomConfig : IEntityTypeConfiguration<Room>
    {
        public void Configure(EntityTypeBuilder<Room> builder)
        {
            // Configure relationships
            builder.HasMany(r => r.ExamSlotRooms)
                   .WithOne(esr => esr.Room)
                   .HasForeignKey(esr => esr.RoomId);
        }
    }
} 