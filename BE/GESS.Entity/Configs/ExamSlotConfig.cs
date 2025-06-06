using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class ExamSlotConfig : IEntityTypeConfiguration<ExamSlot>
    {
        public void Configure(EntityTypeBuilder<ExamSlot> builder)
        {
            builder.HasKey(es => es.ExamSlotId);

            builder.Property(es => es.ExamSlotId);

            builder.Property(es => es.StartTime)
                .IsRequired();

            builder.Property(es => es.EndTime)
                .IsRequired();
        }
    }
} 