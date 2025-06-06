using GESS.Entity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GESS.Entity.Configs
{
    public class MultiAnswerConfig : IEntityTypeConfiguration<MultiAnswer>
    {
        public void Configure(EntityTypeBuilder<MultiAnswer> builder)
        {
            // Configure relationships
            builder.HasOne(ma => ma.MultiQuestion)
                   .WithMany(mq => mq.MultiAnswers)
                   .HasForeignKey(ma => ma.MultiQuestionId);
        }
    }
} 