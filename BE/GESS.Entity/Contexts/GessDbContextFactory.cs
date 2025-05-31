using GESS.Common;
using GESS.Entity.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace GESS.Entity.Contexts
{
    public class GessDbContextFactory : IDesignTimeDbContextFactory<GessDbContext>
    {
        public GessDbContext CreateDbContext(string[] args)
        {
            // Đọc cấu hình từ appsettings.json
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true) // Đảm bảo file tồn tại
                .Build();

            // Sử dụng Constants.ConnectionString để đồng bộ
            var connectionString = Constants.ConnectionString;

            var optionsBuilder = new DbContextOptionsBuilder<GessDbContext>();
            optionsBuilder.UseSqlServer(connectionString, config =>
            {
                config.EnableRetryOnFailure(); 
            });

            return new GessDbContext(optionsBuilder.Options);
        }
    }
}