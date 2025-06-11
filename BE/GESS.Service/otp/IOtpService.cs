using GESS.Model.Email;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.otp
{
    public interface IOtpService
    {
        Task<bool> SendOtpAsync(string email);
        bool VerifyOtp(VerifyOtpDTO verifyOtpDTO);
    }
}
