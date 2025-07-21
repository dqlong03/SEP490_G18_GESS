using GESS.Model.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.authservice
{
    public interface IAuthService
    {
        Task<LoginResult> LoginWithGoogleAsync(GoogleLoginModel model);
        Task<GoogleLoginDesktopResult> LoginWithGoogleDesktopAsync(GoogleLoginModel model);
        Task<LoginResult> LoginAsync(LoginModel loginModel);
        Task<LoginResult> RefreshTokenAsync(string refreshToken);
        Task<bool> ResetPasswordAsync(ResetPasswordDTO model);
    }
}
