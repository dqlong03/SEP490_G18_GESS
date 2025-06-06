using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class ExamServiceConfig : IEntityTypeConfiguration<ExamService>
    {
        public void Configure(EntityTypeBuilder<ExamService> builder)
        {
            // Configure relationships
            builder.HasOne(es => es.User)
                   .WithOne(u => u.ExamService)
                   .HasForeignKey<ExamService>(es => es.UserId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 