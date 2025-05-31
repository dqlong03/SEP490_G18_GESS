using Microsoft.Extensions.Configuration;
using System;

namespace GESS.Common
{
    public static class Constants
    {
        private static IConfiguration _configuration;

        public static void Initialize(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public static string ConnectionString => _configuration?.GetConnectionString("GessDb")
            ?? throw new ArgumentNullException("Connection string 'GessDb' not found in appsettings.json");

        public static string Issuer => _configuration?["Jwt:Issuer"]
            ?? throw new ArgumentNullException("Jwt:Issuer not found in appsettings.json");

        public static string Audience => _configuration?["Jwt:Audience"]
            ?? throw new ArgumentNullException("Jwt:Audience not found in appsettings.json");

        public static string SecretKey => _configuration?["Jwt:SecretKey"]
            ?? throw new ArgumentNullException("Jwt:SecretKey not found in appsettings.json");

        public static int Expires => int.Parse(_configuration?["Jwt:Expires"]
            ?? throw new ArgumentNullException("Jwt:Expires not found in appsettings.json"));
    }
}