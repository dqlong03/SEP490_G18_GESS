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
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();

            Constants.Initialize(configuration);

            var optionsBuilder = new DbContextOptionsBuilder<GessDbContext>();
            optionsBuilder.UseSqlServer(Constants.ConnectionString);

            return new GessDbContext(optionsBuilder.Options);
        }
    }
}