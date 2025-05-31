using GESS.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.authservice
{
    public interface IAuthService
    {
        Task<LoginResult> LoginAsync(LoginModel loginModel);
        Task<LoginResult> RefreshTokenAsync(string refreshToken);
    }
}
